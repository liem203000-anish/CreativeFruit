const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

const fs = require('fs');
const path = require('path');

class FFmpegService {
    // Merge multiple video files
    async mergeVideos(videoPaths, outputPath, options = {}) {
        return new Promise((resolve, reject) => {
            let command = ffmpeg();
            
            // Add input videos
            videoPaths.forEach(videoPath => {
                if (!fs.existsSync(videoPath)) {
                    return reject(new Error(`Video file not found: ${videoPath}`));
                }
                command = command.input(videoPath);
            });
            
            // Create file list for concat
            const fileListPath = outputPath + '.txt';
            const fileListContent = videoPaths.map(p => `file '${path.resolve(p)}'`).join('\n');
            fs.writeFileSync(fileListPath, fileListContent);
            
            command
                .input(fileListPath)
                .inputOptions(['-f concat', '-safe 0'])
                .outputOptions(['-c copy'])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg merge started:', commandLine);
                })
                .on('end', () => {
                    // Clean up file list
                    if (fs.existsSync(fileListPath)) {
                        fs.unlinkSync(fileListPath);
                    }
                    console.log('Videos merged successfully:', outputPath);
                    resolve(outputPath);
                })
                .on('error', (err, stdout, stderr) => {
                    console.error('FFmpeg merge error:', err);
                    console.error('FFmpeg stderr:', stderr);
                    reject(new Error(`Video merge failed: ${err.message}`));
                })
                .run();
        });
    }

    // Add audio to video
    async addAudioToVideo(videoPath, audioPath, outputPath, options = {}) {
        const { volume = 0.5, fadeIn = 0, fadeOut = 0 } = options;
        
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(videoPath)) {
                return reject(new Error(`Video file not found: ${videoPath}`));
            }
            if (!fs.existsSync(audioPath)) {
                return reject(new Error(`Audio file not found: ${audioPath}`));
            }
            
            let command = ffmpeg(videoPath);
            
            command = command.input(audioPath);
            
            // Build audio filter
            let audioFilter = `[1:a]volume=${volume}[a]`;
            if (fadeIn > 0) {
                audioFilter = `[1:a]afade=t=in:st=0:d=${fadeIn},volume=${volume}[a]`;
            }
            
            command
                .complexFilter([
                    audioFilter
                ])
                .outputOptions([
                    '-map', '0:v',
                    '-map', '[a]',
                    '-c:v', 'copy',
                    '-c:a', 'aac',
                    '-shortest'
                ])
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg add audio started:', commandLine);
                })
                .on('end', () => {
                    console.log('Audio added successfully:', outputPath);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('FFmpeg add audio error:', err);
                    reject(new Error(`Add audio failed: ${err.message}`));
                })
                .run();
        });
    }

    // Trim video
    async trimVideo(videoPath, outputPath, startTime, endTime) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(videoPath)) {
                return reject(new Error(`Video file not found: ${videoPath}`));
            }
            
            ffmpeg(videoPath)
                .setStartTime(startTime)
                .setDuration(endTime - startTime)
                .output(outputPath)
                .on('end', () => {
                    console.log('Video trimmed successfully:', outputPath);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    reject(new Error(`Trim video failed: ${err.message}`));
                })
                .run();
        });
    }

    // Get video metadata
    async getMetadata(videoPath) {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(videoPath)) {
                return reject(new Error(`Video file not found: ${videoPath}`));
            }
            
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    return reject(new Error(`FFprobe failed: ${err.message}`));
                }
                
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                
                resolve({
                    duration: Math.floor(metadata.format.duration),
                    resolution: videoStream ? `${videoStream.width}x${videoStream.height}` : 'unknown',
                    videoCodec: videoStream?.codec_name,
                    audioCodec: audioStream?.codec_name,
                    frameRate: videoStream?.r_frame_rate,
                    size: fs.statSync(videoPath).size
                });
            });
        });
    }

    // Generate thumbnail
    async generateThumbnail(videoPath, outputPath, time = '00:00:01') {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(videoPath)) {
                return reject(new Error(`Video file not found: ${videoPath}`));
            }
            
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [time],
                    filename: path.basename(outputPath),
                    folder: path.dirname(outputPath),
                    size: '320x240'
                })
                .on('end', () => {
                    console.log('Thumbnail generated:', outputPath);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    reject(new Error(`Thumbnail generation failed: ${err.message}`));
                });
        });
    }

    // Apply quality settings and format conversion
    async applyQuality(inputPath, outputPath, options = {}) {
        const { quality = 'high', format = 'mp4' } = options;
        
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(inputPath)) {
                return reject(new Error(`Input file not found: ${inputPath}`));
            }
            
            let command = ffmpeg(inputPath);
            
            // Quality settings
            const qualityMap = {
                'low': ['-crf', '28', '-preset', 'fast'],
                'medium': ['-crf', '23', '-preset', 'medium'],
                'high': ['-crf', '18', '-preset', 'slow'],
                'ultra': ['-crf', '15', '-preset', 'veryslow']
            };
            
            const qualitySettings = qualityMap[quality] || qualityMap['high'];
            
            command = command.outputOptions(qualitySettings);
            
            // Format-specific options
            if (format === 'webm') {
                command = command.outputOptions(['-c:v', 'libvpx-vp9', '-c:a', 'libopus']);
            } else if (format === 'mp4') {
                command = command.outputOptions(['-c:v', 'libx264', '-c:a', 'aac']);
            }
            
            command
                .output(outputPath)
                .on('start', (commandLine) => {
                    console.log('FFmpeg quality processing started:', commandLine);
                })
                .on('end', () => {
                    console.log('Quality processing completed:', outputPath);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error('FFmpeg quality processing error:', err);
                    reject(new Error(`Quality processing failed: ${err.message}`));
                })
                .run();
        });
    }
}

module.exports = new FFmpegService();
