export default () => ({
    port: parseInt(process.env.PORT || "3000"),
    dbHost: process.env.DB_HOST,
    dbPort: parseInt(process.env.DB_PORT || "5432"),
    dbUsername: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbDatabase: process.env.DB_DATABASE,
    // add secret later
})