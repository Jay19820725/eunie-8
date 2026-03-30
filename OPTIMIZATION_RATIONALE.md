# Optimization Rationale: Batch Inserts vs. N+1 Queries

## Issue: N+1 Query in Database Seeding
The current implementation of database seeding for `music_tracks`, `ai_prompts`, and `bottle_tags` in `src/server/db.ts` uses a loop that executes a separate `INSERT` query for each record. This is a classic N+1 query problem during the initialization phase.

### Inefficiency
1. **Network Round-trips:** Each `await pool.query(...)` call involves a network round-trip between the application and the database server. If there are $N$ records, there are $N$ round-trips.
2. **Database Overhead:** For each query, the database must parse the SQL, create an execution plan, and manage transaction overhead (even if implicit).
3. **Latency Sensitivity:** In cloud environments where the application and database might be in different zones or connected via a network with non-zero latency, these round-trips significantly increase the total time taken for seeding.

## Solution: Batch INSERT Statements
By combining multiple records into a single `INSERT` statement with multiple `VALUES` clauses, we can reduce the number of queries from $N$ to 1.

### Example Optimization
**Before:**
```typescript
for (const track of seedTracks) {
  await pool.query(
    "INSERT INTO music_tracks (...) VALUES ($1, $2, ...)",
    [track.name, track.title, ...]
  );
}
```

**After:**
```typescript
const values = seedTracks.map((_, i) =>
  `($${i * 7 + 1}, $${i * 7 + 2}, $${i * 7 + 3}, $${i * 7 + 4}, $${i * 7 + 5}, $${i * 7 + 6}, $${i * 7 + 7})`
).join(", ");

const params = seedTracks.flatMap(track => [
  track.name, track.title, track.artist, track.category, track.element, track.url, track.sort_order
]);

await pool.query(
  `INSERT INTO music_tracks (name, title, artist, category, element, url, sort_order)
   VALUES ${values} ON CONFLICT (url) DO NOTHING`,
  params
);
```

## Theoretical Performance Gains
1. **Reduced Latency:** The total time spent on network round-trips is reduced from $O(N \times \text{latency})$ to $O(1 \times \text{latency})$.
2. **Improved Throughput:** The database can process all records in a single operation, which is much more efficient than processing them one by one.
3. **Scaling:** As the number of seed records grows, the performance difference between individual inserts and batch inserts becomes even more pronounced.
