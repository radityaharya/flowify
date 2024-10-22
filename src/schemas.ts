import { z } from "zod";

export const operationParamsTypesMap = {
  "Filter.filter": z.object({
    filterKey: z.string(),
    filterValue: z.string(),
  }),
  "Filter.dedupeTracks": z.object({}),
  "Filter.dedupeArtists": z.object({}),
  "Filter.match": z.object({
    matchKey: z.string(),
    matchValue: z.string(),
  }),
  "Filter.limit": z.object({
    limit: z.number(),
  }),
  "Filter.excludeTracks": z.object({
    operationId: z.string(),
  }),
  "Combiner.push": z.object({}),
  "Combiner.alternate": z.object({}),
  "Combiner.randomStream": z.object({}),
  "Utility.save": z.object({}),
  "Utility.removeKeys": z.object({
    keys: z.array(z.string()),
  }),
  "Utility.includeOnlyKeys": z.object({
    keys: z.array(z.string()),
  }),
  "Utility.summary": z.object({}),
  "Order.sort": z.object({
    sortKey: z.string(),
    sortOrder: z.string(),
  }),
  "Order.shuffle": z.object({}),
  "Order.reverse": z.object({}),
  "Order.separateArtists": z.object({}),
  "Library.saveAsNew": z.object({
    name: z.string(),
    isPublic: z.boolean().optional(),
    collaborative: z.boolean().optional(),
    description: z.string().optional(),
  }),
  "Library.playlistTracks": z.object({
    playlistId: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  "Library.saveAsAppend": z.object({
    playlistId: z.string(),
  }),
  "Library.saveAsReplace": z.object({
    playlistId: z.string(),
  }),
  "Library.likedTracks": z.object({
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  "Library.albumTracks": z.object({
    albumId: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  "Library.artistTopTracks": z.object({
    artistId: z.string(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  "Library.myTopTracks": z.object({
    timeRange: z
      .union([
        z.literal("short_term"),
        z.literal("medium_term"),
        z.literal("long_term"),
      ])
      .optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  "Selector.first": z.object({
    count: z.number().optional(),
  }),
  "Selector.last": z.object({
    count: z.number().optional(),
  }),
  "Selector.allButFirst": z.object({}),
  "Selector.allButLast": z.object({}),
  "Selector.recommend": z.object({
    seedType: z.string().optional(),
    count: z.number().optional(),
  }),
};

const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const PlaylistSchema = z.object({
  playlistId: z.optional(z.string()),
  name: z.optional(z.string()),
  description: z.optional(z.string()),
  image: z.optional(z.string()),
  owner: z.optional(z.string()),
  total: z.optional(z.number()),
});

const ComputedSchema = z.object({
  width: z.number(),
  height: z.number(),
  positionAbsolute: PositionSchema,
});

const RFStateSchema = z.object({
  position: PositionSchema,
  data: z.optional(PlaylistSchema),
  computed: z.optional(ComputedSchema),
  selected: z.optional(z.boolean()),
  dragging: z.optional(z.boolean()),
});

const OperationSchema = z
  .object({
    id: z.string(),
    type: z.string().transform((val, ctx) => {
      const operationType = val;
      const schema = operationParamsTypesMap[operationType];
      if (!schema) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid operation type: ${val}`,
        });
        return val;
      }
      return val;
    }),
    params: z.any(),
    sources: z.array(z.string()),
    tracks: z.optional(z.array(z.any())),
    rfstate: RFStateSchema,
  })
  .superRefine((obj, ctx) => {
    const operationType = obj.type;
    const schema = operationParamsTypesMap[
      operationType
    ] as (typeof operationParamsTypesMap)[keyof typeof operationParamsTypesMap];
    if (!schema) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Invalid operation type: ${operationType}`,
        path: ["type"],
        params: { value: operationType },
      });
      return false;
    }
    const result = schema.safeParse(obj.params);
    if (!result.success) {
      try {
        const errors = JSON.parse(result.error.message);
        const messages = errors.map(
          (error) =>
            `Path ${error.path.join(".")}: Expected ${
              error.expected
            }, received ${error.received}`,
        );
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid operation params: ${messages.join(" | ")}`,
          path: ["params"],
          params: { value: obj.params },
        });
      } catch (e) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid operation params: ${result.error.message}`,
          path: ["params"],
          params: { value: obj.params },
        });
      }
      return false;
    }
    return true;
  });

const ConnectionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export const validateConnectionsCount = (obj: any, ctx: any) => {
  const { connections, operations } = obj;
  if (connections.length !== operations.length - 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Invalid number of connections`,
      path: ["connections"],
    });
  }
};

export const validateDuplicateOperationIds = (obj: any, ctx: any) => {
  const operationIds = new Set();
  obj.operations.forEach((operation) => {
    if (operationIds.has(operation.id)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Duplicate operation id: ${operation.id}`,
        path: ["operations"],
        params: { id: operation.id, value: operation },
      });
    }
    operationIds.add(operation.id);
  });
};

const isCyclic = (
  connections: any[],
  source: string,
  visited: Set<any>,
  recStack: Set<any>,
) => {
  if (!visited.has(source)) {
    visited.add(source);
    recStack.add(source);
    for (const connection of connections) {
      if (connection.source === source) {
        if (
          !visited.has(connection.target) &&
          isCyclic(connections, connection.target, visited, recStack)
        ) {
          return true;
        } else if (recStack.has(connection.target)) {
          return true;
        }
      }
    }
  }
  recStack.delete(source);
};

export const validateLoopInConnections = (obj: any, ctx: any) => {
  const visited = new Set();
  const recStack = new Set();
  obj.connections.forEach((connection) => {
    if (isCyclic(obj.connections, connection.source, visited, recStack)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Loop in connections`,
        path: ["connections"],
        params: { id: connection.id, value: connection },
      });
    }
  });
};

export const validateLoopsInOperations = (obj: any, ctx: any) => {
  const visitedOps = new Set();
  obj.operations.forEach((operation) => {
    if (isCyclic(obj.connections, operation.id, visitedOps, new Set())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Loop in operations`,
        path: ["operations"],
        params: { id: operation.id, value: operation },
      });
    }
  });
};

export const WorkflowObjectSchema = z
  .object({
    id: z.optional(z.string()),
    name: z.string(),
    description: z.optional(z.string()),
    operations: z.array(OperationSchema),
    connections: z.array(ConnectionSchema),
    dryrun: z.optional(z.boolean()),
    cron: z.optional(z.string()),
  })
  .superRefine((obj, ctx) => {
    validateConnectionsCount(obj, ctx);
    validateDuplicateOperationIds(obj, ctx);
    validateLoopInConnections(obj, ctx);
    validateLoopsInOperations(obj, ctx);

    return true;
  });

const WorkflowRunSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  completedAt: z.optional(z.number()),
  startedAt: z.number(),
  error: z.optional(z.string()),
  workerId: z.string(),
});

const WorkflowResponseSchema = z.object({
  id: z.optional(z.string()),
  workflow: WorkflowObjectSchema,
  cron: z.optional(z.string()),
  createdAt: z.optional(z.number()),
  lastRunAt: z.optional(z.number()),
  modifiedAt: z.optional(z.number()),
  runs: z.optional(z.array(WorkflowRunSchema)),
});

const WorkflowRunOperationSchema = z.object({
  id: z.string(),
  workflowRunId: z.string(),
  completedAt: z.string(),
  data: z.string(),
  startedAt: z.string(),
});

const QueueResponseSchema = z.object({
  id: z.string(),
  workflowId: z.string(),
  status: z.string(),
  error: z.optional(z.string()),
  startedAt: z.string(),
  completedAt: z.string(),
  workerId: z.string(),
  returnValues: z.optional(z.any()),
  workflow: z.optional(WorkflowObjectSchema),
  operations: z.optional(z.array(WorkflowRunOperationSchema)),
});

const SystemInfoSchema = z.object({
  workers: z.array(
    z.object({
      status: z.string().optional(),
      joinedAt: z.date().optional(),
      concurrency: z.number().optional(),
      threads: z.number().optional(),
    }),
  ),
  systemStatus: z.union([
    z.string(),
    z.object({
      message: z.string().optional(),
      status: z.string().optional(),
      id: z.string(),
      createdAt: z.date().optional(),
    }),
  ]),
});

declare global {
  namespace Workflow {
    type Operation = z.infer<typeof OperationSchema>;
    type WorkflowObject = z.infer<typeof WorkflowObjectSchema>;
    type WorkflowResponse = z.infer<typeof WorkflowResponseSchema>;
    type WorkflowRunOperation = z.infer<typeof WorkflowRunOperationSchema>;
    type QueueResponse = z.infer<typeof QueueResponseSchema>;
    type SystemInfo = z.infer<typeof SystemInfoSchema>;
    type Connection = z.infer<typeof ConnectionSchema>;
    type Playlist = z.infer<typeof PlaylistSchema>;
  }
}
