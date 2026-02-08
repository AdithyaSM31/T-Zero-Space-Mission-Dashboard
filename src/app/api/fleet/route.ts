import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://ll.thespacedevs.com/2.2.0",
};

const ROCKET_IDS = [
  164, // Falcon 9 Block 5
  464, // Starship
  143, // SLS Block 1
  38,  // PSLV-XL
  172, // LVM3
  116, // Ariane 64
  200, // Vulcan
  138  // New Glenn
];

export async function GET() {
    try {
        const promises = ROCKET_IDS.map(async (id) => {
            try {
                 const res = await fetch(`${BASE_URLS.SPACE_DEVS}/config/launcher/${id}/`, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 86400 } });
                 if(!res.ok) return null;
                 return res.json();
            } catch (e) {
                console.error(`Failed to fetch rocket ${id}`, e);
                return null;
            }
        });

        const results = await Promise.all(promises);
        const fleet = results.filter((r) => r !== null);
        return NextResponse.json(fleet);
    } catch (error) {
        console.error("Fleet API Error:", error);
        return NextResponse.json([], { status: 500 });
    }
}
