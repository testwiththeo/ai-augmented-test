import { ChromaClient } from "chromadb";
import dotenv from "dotenv";

dotenv.config();

const COLLECTION_NAME = "healed_selectors";
const CHROMA_DB_PATH = process.env.CHROMA_DB_PATH || "./.chroma_db";

let client: ChromaClient | null = null;
let collection: any = null;

async function getClient(): Promise<ChromaClient> {
  if (!client) {
    client = new ChromaClient({
      path: CHROMA_DB_PATH,
    });
  }
  return client;
}

async function getCollection(): Promise<any> {
  if (collection) return collection;

  const c = await getClient();
  try {
    collection = await c.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
  } catch {
    // In-memory fallback if persistence fails
    collection = await c.getOrCreateCollection({
      name: COLLECTION_NAME,
    });
  }
  return collection;
}

export interface HealedSelectorRecord {
  id: string;
  originalSelector: string;
  healedSelector: string;
  elementDescription: string;
  pageUrl: string;
  domSnippet: string;
  timestamp: string;
}

/**
 * Store a healed selector in ChromaDB for future reuse.
 */
export async function storeHealedSelector(
  record: HealedSelectorRecord
): Promise<void> {
  try {
    const col = await getCollection();
    const embedding = generateEmbedding(record.originalSelector, record.elementDescription);

    await col.add({
      ids: [record.id],
      embeddings: [embedding],
      metadatas: [
        {
          originalSelector: record.originalSelector,
          healedSelector: record.healedSelector,
          elementDescription: record.elementDescription,
          pageUrl: record.pageUrl,
          timestamp: record.timestamp,
        },
      ],
      documents: [record.domSnippet.substring(0, 1000)],
    });

    console.log(`[ChromaDB] Stored healed selector: ${record.originalSelector} → ${record.healedSelector}`);
  } catch (error) {
    console.warn("[ChromaDB] Failed to store healed selector:", error);
  }
}

/**
 * Find a previously healed selector that matches the failed selector.
 * Returns the healed selector if found, null otherwise.
 */
export async function findHealedSelector(
  failedSelector: string,
  elementDescription: string,
  pageUrl: string
): Promise<string | null> {
  try {
    const col = await getCollection();
    const embedding = generateEmbedding(failedSelector, elementDescription);

    const results = await col.query({
      queryEmbeddings: [embedding],
      nResults: 3,
    });

    if (!results.ids[0]?.length) return null;

    // Find the best match based on metadata similarity
    for (let i = 0; i < results.ids[0].length; i++) {
      const metadata = results.metadatas[0][i];
      if (metadata) {
        const score = calculateSimilarity(
          failedSelector,
          metadata.originalSelector as string
        );
        // Threshold: 0.7 means 70% similar
        if (score > 0.7) {
          console.log(
            `[ChromaDB] Found cached healing: ${metadata.originalSelector} → ${metadata.healedSelector} (score: ${score.toFixed(2)})`
          );
          return metadata.healedSelector as string;
        }
      }
    }

    return null;
  } catch (error) {
    // ChromaDB might not be available — fall back to OpenAI
    console.warn("[ChromaDB] Query failed (falling back to OpenAI):", error);
    return null;
  }
}

/**
 * Simple embedding: use the concatenated text as a basic vector.
 * For production, use a real embedding model. This is a simplified version.
 */
function generateEmbedding(selector: string, description: string): number[] {
  const text = `${selector} ${description}`.toLowerCase();
  const vector = new Array(128).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    vector[i % 128] += charCode / 255;
  }
  // Normalize
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

/**
 * Simple string similarity using Dice coefficient.
 */
function calculateSimilarity(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  if (aLower === bLower) return 1;
  if (aLower.length < 2 || bLower.length < 2) return 0;

  const bigrams = new Set<string>();
  for (let i = 0; i < aLower.length - 1; i++) {
    bigrams.add(aLower.substring(i, i + 2));
  }

  let intersection = 0;
  for (let i = 0; i < bLower.length - 1; i++) {
    if (bigrams.has(bLower.substring(i, i + 2))) {
      intersection++;
    }
  }

  return (2 * intersection) / (aLower.length - 1 + bLower.length - 1);
}
