// API module: encapsulates server calls for commission calculations
export async function postCommission(payload) {
    // console.log('Posting commission data to server:', payload);
    const url = 'http://localhost:3000/api/commissions';
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    // Try to parse JSON, fallback to text on failure
    let body;
    try {
        body = await res.json();
    } catch (err) {
        const text = await res.text();
        throw new Error(text || 'Invalid JSON response from server');
    }

    if (!res.ok) {
        const message = body && body.message ? body.message : res.statusText;
        throw new Error(message || 'Request failed');
    }

    return body;
}
