# Supabase Table Schemas

This document outlines the schemas for new tables to be created in Supabase for the HairNature AI application.

## `coloring_recipes` Table

Stores natural hair coloring recipes. This table will likely be populated by admins and read by users.

| Column Name      | Data Type        | Constraints & Notes                                  |
|------------------|------------------|------------------------------------------------------|
| `id`             | `uuid`           | Primary Key, Default: `uuid_generate_v4()`           |
| `name`           | `text`           | Not Null, Name of the coloring recipe (e.g., "Henna Mix for Red Tones") |
| `ingredients`    | `jsonb`          | Not Null, Array of objects (e.g., `[{"item": "Henna powder", "quantity": "100g"}, {"item": "Amla powder", "quantity": "50g"}]`) |
| `instructions`   | `text`           | Not Null, Step-by-step instructions                  |
| `description`    | `text`           | Optional, A brief description of the recipe and its expected results |
| `image_url`      | `text`           | Optional, URL to an image of the recipe/result       |
| `created_at`     | `timestamptz`    | Not Null, Default: `now()`                           |
| `updated_at`     | `timestamptz`    | Not Null, Default: `now()`                           |

**Row Level Security (RLS) Policies:**
*   Enable RLS.
*   Public read-only access: Users should be able to read all recipes.
    ```sql
    CREATE POLICY "Allow public read access to coloring recipes"
    ON public.coloring_recipes
    FOR SELECT
    USING (true);
    ```
*   Admin-only for CUD: Create, Update, Delete operations should be restricted to users with an 'admin' role (role management to be defined). This might involve a custom admin claim in Supabase Auth.

## `progress_log` Table

Stores user-specific progress logs for their haircare journey.

| Column Name      | Data Type        | Constraints & Notes                                  |
|------------------|------------------|------------------------------------------------------|
| `id`             | `uuid`           | Primary Key, Default: `uuid_generate_v4()`           |
| `user_id`        | `uuid`           | Not Null, Foreign Key referencing `auth.users(id)`   |
| `log_date`       | `date`           | Not Null, Date of the log entry                      |
| `notes`          | `text`           | Not Null, User's notes or observations               |
| `image_url`      | `text`           | Optional, URL to an image associated with the log    |
| `created_at`     | `timestamptz`    | Not Null, Default: `now()`                           |
| `updated_at`     | `timestamptz`    | Not Null, Default: `now()`                           |

**Row Level Security (RLS) Policies:**
*   Enable RLS.
*   Users can only manage their own logs:
    ```sql
    CREATE POLICY "Allow individual access to own progress logs"
    ON public.progress_log
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
    ```
