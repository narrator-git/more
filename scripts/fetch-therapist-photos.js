#!/usr/bin/env node
// One-time script: fetches Unsplash headshots and saves to images/therapists/
// Run: node scripts/fetch-therapist-photos.js

const fs = require('fs');
const path = require('path');

const HEADSHOTS = [
    'photo-1494790108377-be9c29b29330', 'photo-1507003211169-0a1dd7228f2d',
    'photo-1438761681033-6461ffad8d80', 'photo-1472099645785-5658abf4ff4e',
    'photo-1544005313-94ddf0286df2', 'photo-1560250097-0b93528c311a',
    'photo-1573496359142-b8d87734a5a2', 'photo-1519085360753-af0119f7cbe7',
    'photo-1580489944761-15a19d654956', 'photo-1506794778202-cad84cf45f1d',
    'photo-1607746882042-944635dfe10e', 'photo-1566492031773-4f4e44671857',
    'photo-1534528741775-53994a69daeb', 'photo-1500648767791-00dcc994a43e',
    'photo-1567532939604-b6b5b0db2604', 'photo-1522075469751-3a6694fb2f61',
    'photo-1548142813-c348350df52b', 'photo-1564564321837-a57b7070ac4f',
    'photo-1589156229687-496a31ad1d1f', 'photo-1552058544-f2b08422138a',
    'photo-1531746020798-e6953c6e8e04', 'photo-1506277886164-e25aa3f4ef7f',
    'photo-1487412720507-e7ab37603c6f', 'photo-1603415526960-f7e0328c63b1',
    'photo-1517841905240-472988babdf9', 'photo-1504257432389-52343af06ae3',
    'photo-1558898479-33c0057a5d12', 'photo-1570295999919-56ceb5ecca61',
    'photo-1508214751196-bcfd4ca60f91', 'photo-1539571696357-5a69c17a67c6'
];

const dir = path.join(__dirname, '..', 'images', 'therapists');

async function main() {
    fs.mkdirSync(dir, { recursive: true });
    for (let i = 0; i < HEADSHOTS.length; i++) {
        const url = `https://images.unsplash.com/${HEADSHOTS[i]}?w=400&h=500&fit=crop&crop=faces&auto=format&q=80`;
        process.stdout.write(`Fetching ${i + 1}/${HEADSHOTS.length}... `);
        const res = await fetch(url, { redirect: 'follow' });
        if (!res.ok) throw new Error(`${url} => ${res.status}`);
        const buf = await res.arrayBuffer();
        fs.writeFileSync(path.join(dir, `${i}.jpg`), Buffer.from(buf));
        console.log('OK');
    }
    console.log(`Done. Saved ${HEADSHOTS.length} images to images/therapists/`);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
