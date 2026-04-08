import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import ClipService from './ml/clip';
import { getPhotoMetadata, updatePhotoMetadata, initDb } from './db';

const BACKGROUND_SYNC_TASK = 'background-gallery-sync';

TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
    try {
        console.log("Background Sync Task Running...");
        await initDb();
        
        // 1. Fetch latest photos
        const media = await MediaLibrary.getAssetsAsync({
            mediaType: MediaLibrary.MediaType.photo,
            first: 50,
            sortBy: MediaLibrary.SortBy.creationTime,
        });

        // 2. Filter unindexed photos
        const unindexed = [];
        for (const asset of media.assets) {
            const meta = await getPhotoMetadata(asset.id);
            if (!meta || !meta.embedding) {
                unindexed.push(asset);
            }
        }

        if (unindexed.length === 0) {
            return BackgroundFetch.BackgroundFetchResult.NoData;
        }

        // 3. Generate embeddings locally
        for (const asset of unindexed) {
            try {
                // Read image base64 locally to route to local ONNX executor
                const base64Info = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: 'base64' as any,
                });
                const dataUri = `data:image/jpeg;base64,${base64Info}`;
                
                const embedding = await ClipService.embedImage(dataUri);
                if (embedding) {
                    await updatePhotoMetadata(asset.id, { embedding });
                    console.log(`Successfully embedded locally: ${asset.id}`);
                }
            } catch (innerError) {
                console.log(`Failed to process ${asset.id}`, innerError);
            }
        }

        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (error) {
        console.error("Background task error", error);
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerBackgroundSync() {
    try {
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);
        if (!isRegistered) {
            await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
                minimumInterval: 15 * 60, // 15 mins
                stopOnTerminate: false, 
                startOnBoot: true, 
            });
            console.log("Registered background sync!");
        }
    } catch (err) {
        console.error("Failed to register background task", err);
    }
}
