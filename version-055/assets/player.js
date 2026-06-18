var hlsModulePromise = null;

function importHlsModule() {
  if (!hlsModulePromise) {
    hlsModulePromise = import("https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.mjs").then(function (module) {
      return module.default || module.Hls || module;
    });
  }
  return hlsModulePromise;
}

function getPlayerElements(shell) {
  return {
    video: shell.querySelector("video"),
    trigger: shell.querySelector("[data-player-trigger]"),
    stream: shell.getAttribute("data-stream")
  };
}

function nativeHlsAvailable(video) {
  return Boolean(video.canPlayType("application/vnd.apple.mpegurl"));
}

async function preparePlayer(shell) {
  var parts = getPlayerElements(shell);

  if (!parts.video || !parts.stream || shell.dataset.ready === "true") {
    return parts.video;
  }

  if (nativeHlsAvailable(parts.video)) {
    parts.video.src = parts.stream;
    shell.dataset.ready = "true";
    return parts.video;
  }

  try {
    var Hls = await importHlsModule();
    if (Hls && Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(parts.stream);
      hls.attachMedia(parts.video);
      shell.hlsInstance = hls;
      shell.dataset.ready = "true";
      return parts.video;
    }
  } catch (error) {
    shell.dataset.ready = "false";
  }

  parts.video.src = parts.stream;
  shell.dataset.ready = "true";
  return parts.video;
}

async function playMovie(shell) {
  var parts = getPlayerElements(shell);
  var video = await preparePlayer(shell);

  if (!video) {
    return;
  }

  if (parts.trigger) {
    parts.trigger.classList.add("is-hidden");
  }

  try {
    await video.play();
  } catch (error) {
    if (parts.trigger) {
      parts.trigger.classList.remove("is-hidden");
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("[data-player]").forEach(function (shell) {
    var parts = getPlayerElements(shell);

    preparePlayer(shell);

    if (parts.trigger) {
      parts.trigger.addEventListener("click", function () {
        playMovie(shell);
      });
    }

    if (parts.video) {
      parts.video.addEventListener("play", function () {
        if (parts.trigger) {
          parts.trigger.classList.add("is-hidden");
        }
      });

      parts.video.addEventListener("pause", function () {
        if (parts.trigger && parts.video.currentTime === 0) {
          parts.trigger.classList.remove("is-hidden");
        }
      });
    }
  });
});
