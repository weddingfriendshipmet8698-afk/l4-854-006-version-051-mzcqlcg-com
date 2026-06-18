(function () {
    window.startVideoPlayer = function (videoId, layerId, playUrl) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        var started = false;
        var hlsInstance = null;

        if (!video || !layer || !playUrl) {
            return;
        }

        function begin() {
            if (started) {
                video.play();
                return;
            }

            started = true;
            layer.classList.add('is-hidden');

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playUrl;
                video.play();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(playUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
                return;
            }

            video.src = playUrl;
            video.play();
        }

        layer.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
