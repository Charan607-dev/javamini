package com.skillswap.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.nio.file.AtomicMoveNotSupportedException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

/**
 * Robust JSON file persistence helper ensuring atomic writes,
 * safe directory resolution, and protection against accidental corruption or zero-byte file writes.
 */
public final class JsonPersistenceHelper {

    private static final Logger log = LoggerFactory.getLogger(JsonPersistenceHelper.class);

    private JsonPersistenceHelper() {}

    /**
     * Resolves the canonical/absolute path for the data file.
     * Handles both relative and absolute data directory paths reliably.
     */
    public static File resolveFile(String dataDir, String filename) throws IOException {
        Path dirPath;
        if (dataDir == null || dataDir.trim().isEmpty()) {
            dirPath = Paths.get("data").toAbsolutePath().normalize();
        } else {
            dirPath = Paths.get(dataDir.trim()).toAbsolutePath().normalize();
        }

        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
            log.info("Created data directory: {}", dirPath);
        }

        File targetFile = dirPath.resolve(filename).toFile();
        if (!targetFile.exists()) {
            // Touch empty array if file does not exist
            ObjectMapper defaultMapper = new ObjectMapper();
            defaultMapper.writeValue(targetFile, List.of());
            log.info("Initialized empty JSON store at: {}", targetFile.getAbsolutePath());
        }

        return targetFile;
    }

    /**
     * Safely reads items from the JSON file.
     */
    public static <T> List<T> loadList(File file, ObjectMapper mapper, TypeReference<List<T>> typeRef) throws IOException {
        if (!file.exists() || file.length() == 0) {
            return new ArrayList<>();
        }
        try {
            return mapper.readValue(file, typeRef);
        } catch (IOException e) {
            log.error("Failed to read JSON file {}: {}", file.getAbsolutePath(), e.getMessage());
            throw e;
        }
    }

    /**
     * Safely and atomically writes items to the JSON file using a temporary file and atomic replace.
     * Prevents partial writes, data corruption, and 0-byte file truncations on unexpected server termination.
     */
    public static synchronized <T> void saveListAtomically(File targetFile, ObjectMapper mapper, List<T> data) throws IOException {
        File parentDir = targetFile.getParentFile();
        if (parentDir != null && !parentDir.exists()) {
            parentDir.mkdirs();
        }

        // Create temporary file in the same directory (necessary for atomic move across the same filesystem)
        File tempFile = File.createTempFile(targetFile.getName() + ".", ".tmp", parentDir);

        try {
            mapper.writeValue(tempFile, data);

            // Verify temp file write was successful and not corrupted
            if (tempFile.length() == 0 && (data != null && !data.isEmpty())) {
                throw new IOException("Failed to write data: temporary file was empty for non-empty dataset.");
            }

            Path sourcePath = tempFile.toPath();
            Path targetPath = targetFile.toPath();

            try {
                Files.move(sourcePath, targetPath, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
            } catch (AtomicMoveNotSupportedException ex) {
                // Fallback for filesystems that do not support ATOMIC_MOVE
                Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }
}
