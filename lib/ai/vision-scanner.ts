'use client';

// On-Device Open-Source AI Vision Scanner using TensorFlow.js + MobileNet
// 100% Free, Runs completely in the browser via WebGL / WebAssembly (Zero API Keys, Zero Cloud Cost)

export interface ClassificationResult {
  className: string;
  probability: number;
}

export interface ScanResult {
  tags: string[];
  primaryTag: string;
  confidence: number;
  rawPredictions: ClassificationResult[];
}

// Common category synonyms to bridge specific classification labels with user search terms
// e.g. "golden retriever" -> search for "dog" or "puppy"
const CATEGORY_EXPANSIONS: Record<string, string[]> = {
  dog: [
    'retriever', 'terrier', 'hound', 'bulldog', 'shepherd', 'poodle', 'collie', 'spaniel',
    'husky', 'malamute', 'corgi', 'pug', 'beagle', 'chihuahua', 'dalmatian', 'boxer',
    'rottweiler', 'doberman', 'pinscher', 'mastiff', 'dhole', 'dingo', 'wolf'
  ],
  cat: [
    'tabby', 'persian', 'siamese', 'cougar', 'lynx', 'leopard', 'cheetah', 'lion',
    'tiger', 'jaguar', 'egyptian cat', 'angora', 'kitten'
  ],
  car: [
    'sports car', 'convertible', 'limousine', 'cab', 'minivan', 'jeep', 'pickup',
    'racer', 'sedan', 'coupe', 'vehicle', 'automobile'
  ],
  bird: [
    'parrot', 'eagle', 'sparrow', 'robin', 'hawk', 'owl', 'pigeon', 'flamingo',
    'peacock', 'macaw', 'cockatoo', 'duck', 'goose', 'swan'
  ],
  computer: [
    'laptop', 'notebook', 'desktop', 'monitor', 'keyboard', 'mouse', 'ipad', 'screen'
  ],
  phone: [
    'cellular telephone', 'cellphone', 'mobile phone', 'smartphone', 'dial telephone'
  ],
  food: [
    'pizza', 'burger', 'sandwich', 'hotdog', 'salad', 'ice cream', 'cake', 'apple',
    'banana', 'orange', 'bread', 'soup', 'coffee', 'espresso', 'tea'
  ],
  flower: [
    'daisy', 'rose', 'sunflower', 'tulip', 'orchid', 'lily'
  ],
};

// Singleton model instance in browser memory
let cachedModel: any = null;
let modelLoadingPromise: Promise<any> | null = null;

/**
 * Lazy loads MobileNet model in the browser
 */
export async function getVisionModel(): Promise<any> {
  if (typeof window === 'undefined') return null;

  if (cachedModel) return cachedModel;
  if (modelLoadingPromise) return modelLoadingPromise;

  modelLoadingPromise = (async () => {
    try {
      // Dynamic imports prevent SSR errors and avoid increasing initial bundle size
      await import('@tensorflow/tfjs');
      const mobilenet = await import('@tensorflow-models/mobilenet');
      // Load lightweight MobileNet v2 with alpha 0.5/1.0
      const model = await mobilenet.load({
        version: 2,
        alpha: 1.0,
      });
      cachedModel = model;
      return model;
    } catch (err) {
      console.warn('[VisionScanner] Failed to load on-device MobileNet model:', err);
      return null;
    } finally {
      modelLoadingPromise = null;
    }
  })();

  return modelLoadingPromise;
}

/**
 * Expands model prediction terms into high-level searchable tags
 */
function expandTags(predictions: ClassificationResult[]): { tags: string[]; primaryTag: string; confidence: number } {
  if (!predictions || predictions.length === 0) {
    return { tags: [], primaryTag: '', confidence: 0 };
  }

  const tagSet = new Set<string>();
  const primaryPrediction = predictions[0];
  const confidence = Math.round((primaryPrediction.probability || 0) * 100);

  // Process top predictions (up to 4)
  for (const pred of predictions.slice(0, 4)) {
    if (pred.probability < 0.05) continue; // Skip very low confidence noise

    // Class name can be comma separated, e.g. "golden retriever, dog"
    const parts = pred.className.toLowerCase().split(/[,/]/).map((s) => s.trim());

    for (const part of parts) {
      if (!part) continue;
      tagSet.add(part);

      // Check for category expansions (e.g. breed to high-level concept)
      for (const [category, keywords] of Object.entries(CATEGORY_EXPANSIONS)) {
        if (part.includes(category)) {
          tagSet.add(category);
        }
        for (const kw of keywords) {
          if (part.includes(kw)) {
            tagSet.add(category);
            break;
          }
        }
      }

      // Add individual tokens (e.g., "golden retriever" -> also add "golden", "retriever")
      const words = part.split(/\s+/);
      if (words.length > 1) {
        words.forEach((w) => {
          if (w.length > 2) tagSet.add(w);
        });
      }
    }
  }

  const primaryClean = primaryPrediction.className.split(',')[0].trim();
  const allTags = Array.from(tagSet);

  return {
    tags: allTags,
    primaryTag: primaryClean,
    confidence,
  };
}

/**
 * Classifies an image File or Blob directly in the browser
 */
export async function scanImageFile(fileOrBlob: Blob | File): Promise<ScanResult | null> {
  if (typeof window === 'undefined') return null;

  try {
    const model = await getVisionModel();
    if (!model) return null;

    // Create an HTMLImageElement from the blob
    const objectUrl = URL.createObjectURL(fileOrBlob);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = objectUrl;
      });

      // Classify top 5 predictions
      const rawPredictions: ClassificationResult[] = await model.classify(img, 5);
      const { tags, primaryTag, confidence } = expandTags(rawPredictions);

      return {
        tags,
        primaryTag,
        confidence,
        rawPredictions,
      };
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    console.error('[VisionScanner] On-device image classification error:', error);
    return null;
  }
}

/**
 * Classifies an image by its image URL or data URL
 */
export async function scanImageUrl(imageUrl: string): Promise<ScanResult | null> {
  if (typeof window === 'undefined') return null;

  try {
    const model = await getVisionModel();
    if (!model) return null;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(e);
      img.src = imageUrl;
    });

    const rawPredictions: ClassificationResult[] = await model.classify(img, 5);
    const { tags, primaryTag, confidence } = expandTags(rawPredictions);

    return {
      tags,
      primaryTag,
      confidence,
      rawPredictions,
    };
  } catch (error) {
    console.error('[VisionScanner] Image URL classification error:', error);
    return null;
  }
}
