const pool = require('../connection');

async function migrate() {
    try {
        // Check if column exists
        const checkResult = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'did_numbers' AND column_name = 'trunk_password'
        `);
        
        if (checkResult.rows.length === 0) {
            // Add column
            await pool.query(`
                ALTER TABLE did_numbers 
                ADD COLUMN trunk_password VARCHAR(255)
            `);
            console.log('✅ trunk_password column qo\'shildi');
        } else {
            console.log('✅ trunk_password column allaqachon mavjud');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Xato:', error.message);
        process.exit(1);
    }
}

migrate();
