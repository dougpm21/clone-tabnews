import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();
  
  const databaseVersionResult = await database.query("SHOW server_version;");
  const databaseVersionValue = databaseVersionResult.rows[0].server_version;

  const databaseMaxConnectionsResult = await database.query("SHOW max_connections;");
  const databaseMaxConnectionsValue = 
    databaseMaxConnectionsResult.rows[0].max_connections;
  
  const databaseName = process.env.POSTGRES_DB;
  const databaseNameQuery = "SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1";
  const databaseNameQueryValues = [databaseName];
  const databaseOpenedConnectionsResult = await database.query({
    text: databaseNameQuery, 
    values: databaseNameQueryValues
  });

  const databaseOpenedConnectionsValue = 
    databaseOpenedConnectionsResult.rows[0].count;

  response.status(200).json({ 
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersionValue,
        max_connections: parseInt(databaseMaxConnectionsValue),
        opened_connections: databaseOpenedConnectionsValue,
      }
    }
  });
}

export default status;
