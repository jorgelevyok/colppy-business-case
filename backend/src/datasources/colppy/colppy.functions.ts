/**
 * Declarative PL/pgSQL function definitions synced to PostgreSQL on startup.
 * Each entry includes schema, signature, and function body.
 */
const functions = [
  {
    table: 'sales',
    schema: 'public',
    name: 'set_sales_code',
    returns: 'trigger',
    params: '',
    language: 'plpgsql',
    definition: `
          BEGIN
              IF NEW.sale_code IS NULL OR NEW.sale_code = '' THEN
                  NEW.sale_code := 'V-' || COALESCE(
                      (
                          SELECT MAX(CAST(SUBSTRING(sale_code FROM 3) AS INTEGER)) + 1
                          FROM sales
                          WHERE sale_code ~ '^V-[0-9]+$'
                      ),
                      1001
                  );
              END IF;
              RETURN NEW;
          END;
      `,
  },
];

export default functions;
