/**
 * Trigger definitions applied after their linked functions in {@link DatabaseSyncService}.
 */
import functions from './colppy.functions';

const tables: { table: string; name: string }[] = [
  {
    table: 'sales',
    name: 'set_sales_code_trigger',
  },
];

const triggers = tables.map(({ table, name }) => {
  const tableFunction = functions.find((i) => i.table === table);
  if (tableFunction) {
    return {
      table,
      schema: 'public',
      name,
      definition: `
          CREATE TRIGGER 
              ${name} 
          BEFORE INSERT ON 
              public.${table} 
          FOR EACH ROW EXECUTE FUNCTION 
              public.${tableFunction.name}()
      `,
    };
  }
});

export default triggers.filter(Boolean);
