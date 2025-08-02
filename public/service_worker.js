const OFFSCREEN_DOCUMENT_PATH = "/offscreen.html";
let creating; // A global promise to avoid concurrency issues

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "get-geolocation") {
    handleGeolocationRequest(sendResponse);
    return true; // Keep message channel open
  }
});

function handleGeolocationRequest(sendResponse) {
  // Use a more direct approach with immediate response
  setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH)
    .then(() => {
      // Set up a timeout to prevent hanging
      const timeout = setTimeout(() => {
        sendResponse({
          success: false,
          error: "Geolocation request timed out",
        });
      }, 10000);

      // Send message to offscreen document and handle response immediately
      chrome.runtime.sendMessage(
        { type: "get-geolocation", target: "offscreen" },
        (response) => {
          clearTimeout(timeout);

          if (chrome.runtime.lastError) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError.message,
            });
            return;
          }

          if (response && response.error) {
            sendResponse({
              success: false,
              error: response.error,
            });
            return;
          }

          if (response && response.coords) {
            sendResponse({
              success: true,
              data: response,
            });
          } else {
            sendResponse({
              success: false,
              error: "Invalid response from geolocation",
            });
          }

          // Clean up offscreen document
          closeOffscreenDocument().catch(console.warn);
        }
      );
    })
    .catch((error) => {
      sendResponse({
        success: false,
        error: error.message,
      });
    });
}

async function hasDocument() {
  try {
    const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
    const matchedClients = await clients.matchAll();
    return matchedClients.some((c) => c.url === offscreenUrl);
  } catch (error) {
    return false;
  }
}

async function setupOffscreenDocument(path) {
  if (await hasDocument()) {
    return; // Document already exists
  }

  if (creating) {
    await creating;
    return;
  }

  creating = chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.GEOLOCATION],
    justification:
      "Need geolocation access to show prayer times based on user location",
  });

  await creating;
  creating = null;
}

async function closeOffscreenDocument() {
  if (!(await hasDocument())) {
    return;
  }

  try {
    await chrome.offscreen.closeDocument();
  } catch (error) {
    console.warn("Error closing offscreen document:", error);
  }
}
