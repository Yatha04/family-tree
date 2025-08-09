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
  "location" text,
  "gender" text CHECK ("gender" IN ('male','female','other','prefer_not_to_say')),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Optional stored positions for React Flow layout
ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "position_x" integer;
ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "position_y" integer;
ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "location" text;
ALTER TABLE "Members" ADD COLUMN IF NOT EXISTS "gender" text CHECK ("gender" IN ('male','female','other','prefer_not_to_say'));

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

-- Create TreePermissions table (membership and roles)
CREATE TABLE IF NOT EXISTS "TreePermissions" (
  "id" uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  "tree_id" uuid NOT NULL REFERENCES "Trees"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL,
  "role" text NOT NULL CHECK ("role" IN ('admin', 'editor', 'viewer')),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("tree_id", "user_id")
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_trees_admin_user" ON "Trees"("admin_user");
CREATE INDEX IF NOT EXISTS "idx_members_tree_id" ON "Members"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_tree_id" ON "Relationships"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_a_id" ON "Relationships"("a_id");
CREATE INDEX IF NOT EXISTS "idx_relationships_b_id" ON "Relationships"("b_id");
CREATE INDEX IF NOT EXISTS "idx_invites_token" ON "Invites"("token");
CREATE INDEX IF NOT EXISTS "idx_invites_tree_id" ON "Invites"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_tree_permissions_tree_id" ON "TreePermissions"("tree_id");
CREATE INDEX IF NOT EXISTS "idx_tree_permissions_user_id" ON "TreePermissions"("user_id");

-- Set up Row Level Security (RLS)
ALTER TABLE "Trees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invites" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TreePermissions" ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Trees
-- Reset existing policies to avoid recursion from legacy definitions
DROP POLICY IF EXISTS "Users can view their own trees" ON "Trees";
DROP POLICY IF EXISTS "Users can insert their own trees" ON "Trees";
DROP POLICY IF EXISTS "Users can update their own trees" ON "Trees";
DROP POLICY IF EXISTS "Users can delete their own trees" ON "Trees";

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

-- RLS Policies for TreePermissions (basic; consider hardening with invite validation)
CREATE POLICY "Users can view their own permissions" ON "TreePermissions"
  FOR SELECT USING (auth.uid() = "user_id");

CREATE POLICY "Admins can manage permissions for their tree" ON "TreePermissions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM "Trees"
      WHERE "Trees"."id" = "TreePermissions"."tree_id"
      AND "Trees"."admin_user" = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM "Trees"
      WHERE "Trees"."id" = "TreePermissions"."tree_id"
      AND "Trees"."admin_user" = auth.uid()
    )
  );

-- Allow invited users to self-insert a permission (minimal demo policy; refine for production)
CREATE POLICY "Users can insert their own permission" ON "TreePermissions"
  FOR INSERT WITH CHECK (auth.uid() = "user_id");

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
