export async function getPostsFromBackend() {
  try {
    const res = await fetch("http://localhost:3000/item");
    if (!res.ok) throw new Error(await res.text());
    return await res.json(); // Array of { id, itemName, category, ... }
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
}