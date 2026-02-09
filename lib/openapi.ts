export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Bookmarks API",
    version: "1.0.0",
    description: "A personal bookmarking API with categories and tags support.",
  },
  servers: [
    {
      url: "/api",
      description: "API routes",
    },
  ],
  tags: [
    { name: "Bookmarks", description: "Bookmark management" },
    { name: "Categories", description: "Category management" },
    { name: "Tags", description: "Tag management" },
  ],
  paths: {
    "/bookmarks": {
      get: {
        tags: ["Bookmarks"],
        summary: "Get all bookmarks",
        description: "Returns all bookmarks. Each bookmark includes its category and tags.",
        responses: {
          "200": {
            description: "List of bookmarks",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bookmark" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Bookmarks"],
        summary: "Create a bookmark",
        description: "Creates a new bookmark. Automatically fetches page title and favicon if not provided.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["url"],
                properties: {
                  url: {
                    type: "string",
                    format: "uri",
                    description: "The URL to bookmark",
                  },
                  title: {
                    type: "string",
                    description: "Optional title (auto-fetched if not provided)",
                  },
                  categoryId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "Optional category ID",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Bookmark created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Bookmark" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": {
            description: "URL already bookmarked",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/bookmarks/{id}": {
      patch: {
        tags: ["Bookmarks"],
        summary: "Update a bookmark",
        description:
          "Updates a bookmark's title, category, and/or tags. All fields are optional - only provided fields will be updated.",
        parameters: [{ $ref: "#/components/parameters/BookmarkId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    description: "New title for the bookmark",
                  },
                  categoryId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "Category ID, or null to remove category",
                  },
                  tagIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    description: "Array of tag IDs (replaces all existing tags)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Bookmark updated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Bookmark" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Bookmarks"],
        summary: "Delete a bookmark",
        parameters: [{ $ref: "#/components/parameters/BookmarkId" }],
        responses: {
          "200": {
            description: "Bookmark deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { success: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        responses: {
          "200": {
            description: "List of categories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    description: "Category name (slug auto-generated)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/categories/{slug}": {
      patch: {
        tags: ["Categories"],
        summary: "Rename a category",
        parameters: [{ $ref: "#/components/parameters/CategorySlug" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["newName"],
                properties: {
                  newName: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Category renamed",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        description: "Deletes a category. Bookmarks in this category will have their category set to null.",
        parameters: [{ $ref: "#/components/parameters/CategorySlug" }],
        responses: {
          "200": {
            description: "Category deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { success: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/categories/reorder": {
      post: {
        tags: ["Categories"],
        summary: "Reorder categories",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderedIds"],
                properties: {
                  orderedIds: {
                    type: "array",
                    items: { type: "string", format: "uuid" },
                    description: "Category IDs in desired order",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Categories reordered",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { success: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/tags": {
      get: {
        tags: ["Tags"],
        summary: "Get all tags",
        responses: {
          "200": {
            description: "List of tags",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Tag" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Tags"],
        summary: "Create a tag",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    description: "Tag name (will be lowercased)",
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Tag created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { $ref: "#/components/schemas/Tag" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
        },
      },
    },
    "/tags/{id}": {
      delete: {
        tags: ["Tags"],
        summary: "Delete a tag",
        description: "Deletes a tag. The tag will be removed from all bookmarks.",
        parameters: [{ $ref: "#/components/parameters/TagId" }],
        responses: {
          "200": {
            description: "Tag deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "object",
                      properties: { success: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
  components: {
    schemas: {
      Bookmark: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          url: { type: "string", format: "uri" },
          host: { type: "string", description: "Hostname extracted from URL" },
          title: { type: "string" },
          image: { type: "string", nullable: true, description: "Base64 favicon" },
          category: {
            nullable: true,
            allOf: [{ $ref: "#/components/schemas/Category" }],
          },
          tags: {
            type: "array",
            items: { $ref: "#/components/schemas/Tag" },
          },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          slug: { type: "string" },
          order: { type: "integer" },
        },
      },
      Tag: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
      },
    },
    parameters: {
      BookmarkId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
        description: "Bookmark ID",
      },
      CategorySlug: {
        name: "slug",
        in: "path",
        required: true,
        schema: { type: "string" },
        description: "Category slug",
      },
    },
    responses: {
      BadRequest: {
        description: "Invalid request",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
};
