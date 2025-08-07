-- Family Tree Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Trees table
CREATE TABLE IF NOT EXISTS "Trees" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "name" text NOT NULL,
  "admin_user" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Members table
CREATE TABLE IF NOT EXISTS "Members" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "tree_id" uuid NOT NULL REFERENCES "Trees"("id") ON DELETE CASCADE,
  "name" text NOT NULL,
  "birthdate" date,
  "photo_path" text,
  "summary" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create Relationships table
CREATE TABLE IF NOT EXISTS "Relationships" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "tree_id" uuid NOT NULL REFERENCES "Trees"("id") ON DELETE CASCADE,
  "a_id" uuid NOT NULL REFERENCES "Members"("id") ON DELETE CASCADE,
  "b_id" uuid NOT NULL REFERENCES "Members"("id") ON DELETE CASCADE,
  "type" text NOT NULL CHECK ("type" IN ('parent', 'spouse', 'sibling')),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("tree_id", "a_id", "b_id", "type")
);

-- Create Invites table
CREATE TABLE IF NOT EXISTS "Invites" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "tree_id" uuid NOT NULL REFERENCES "Trees"("id") ON DELETE CASCADE,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "role" text NOT NULL DEFAULT 'editor' CHECK ("role" IN ('editor', 'viewer')),
  "accepted" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_trees_admin_user" ON "Trees"("admin_user");
CREATE INDEX IF NOT EXISTS "idx_members_tree_id" ON "Members"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_tree_id" ON "Relationships"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_a_id" ON "Relationships"("a_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_b_id" ON "Relationships"("b_id");
CREATE INDEX IF NOT EXISTS "idx_invites_token" ON "Invites"("token");
CREATE INDEX IF NOT EXISTS "idx_invites_tree_id" ON "Invites"("tree_id");

-- Set up Row Level Security (RLS)
ALTER TABLE "Trees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invites" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Trees
CREATE POLICY "Users can view their own trees" ON "Trees"
  FOR SELECT USING (auth.uid() = "admin_user");

CREATE POLICY "Users can insert their own trees" ON "Trees"
  FOR INSERT WITH CHECK (auth.uid() = "admin_user");

CREATE POLICY "Users can update their own trees" ON "Trees"
  FOR UPDATE USING (auth.uid() = "admin_user");

CREATE POLICY "Users can delete their own trees" ON "Trees"
  FOR DELETE USING (auth.uid() = "admin_user");

-- RLS Policies for Members
CREATE POLICY "Users can view members of their trees" ON "Members"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Members"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can insert members in their trees" ON "Members"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Members"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can update members in their trees" ON "Members"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Members"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can delete members in their trees" ON "Members"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Members"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

-- RLS Policies for Relationships
CREATE POLICY "Users can view relationships in their trees" ON "Relationships"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Relationships"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can insert relationships in their trees" ON "Relationships"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Relationships"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can update relationships in their trees" ON "Relationships"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Relationships"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can delete relationships in their trees" ON "Relationships"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Relationships"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

-- RLS Policies for Invites
CREATE POLICY "Users can view invites for their trees" ON "Invites"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Invites"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can insert invites for their trees" ON "Invites"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Invites"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can update invites for their trees" ON "Invites"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Invites"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );

CREATE POLICY "Users can delete invites for their trees" ON "Invites"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM "Trees" 
      WHERE "Trees"."id" = "Invites"."tree_id" 
      AND "Trees"."admin_user" = auth.uid()
    )
  );
