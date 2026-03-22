import { customType } from "drizzle-orm/pg-core";

export const bytea = customType<{
  data: Uint8Array<ArrayBufferLike> | Buffer;
  notNull: false;
  default: false;
}>({
  dataType() {
    return "bytea";
  },
});
