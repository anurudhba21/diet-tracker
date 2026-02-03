const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log("Starting backend verification...");

        // 1. Create a User
        const email = `test_delete_${Date.now()}@test.com`;
        const regRes = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regData)}`);
        const userId = regData.user.id;
        console.log("User created:", userId);

        // 2. Create an Entry
        const date = new Date().toISOString().split('T')[0];
        const entryRes = await fetch(`${BASE_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                date,
                weight: 80,
                notes: 'Test entry',
                meals: { breakfast: 'Toast' }
            })
        });
        const entryData = await entryRes.json();
        console.log("Entry created response:", entryData);

        // 3. Fetch Entries and Inspect Structure
        const getRes = await fetch(`${BASE_URL}/entries?userId=${userId}`);
        const list = await getRes.json();
        console.log("Fetched entries list:", JSON.stringify(list, null, 2));

        if (list.length === 0) throw new Error("No entries found after creation!");

        const firstEntry = list[0];
        console.log("First Entry Keys:", Object.keys(firstEntry));

        if (firstEntry.id) {
            console.log("SUCCESS: 'id' field found:", firstEntry.id);
        } else if (firstEntry.entry_id) {
            console.log("WARNING: 'entry_id' field found instead of 'id':", firstEntry.entry_id);
        } else {
            console.log("ERROR: No 'id' or 'entry_id' found!");
        }

        // 4. Try Delete
        const idToDelete = firstEntry.id || firstEntry.entry_id;
        console.log("Attempting delete on ID:", idToDelete);

        const delRes = await fetch(`${BASE_URL}/entries/${idToDelete}`, {
            method: 'DELETE'
        });
        const delData = await delRes.json();
        console.log("Delete response:", delData);

    } catch (e) {
        console.error("TEST FAILED:", e);
    }
}

runTest();
