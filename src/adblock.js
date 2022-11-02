console.log("adblock.js Started .. ");
let POST_CLASS = ".x1lliihq";
function findPostClass() {
  // get h3 with content "News feed posts"
  const h3s = document.querySelectorAll("h3");
  for (let i = 0; i < h3s.length; i++) {
    const h3 = h3s[i];
    if (h3.innerText === "News Feed posts") {
      const feed = h3.nextElementSibling;
      if (!feed) return;
      // get first element with a class (first post)
      const firstPost = feed.querySelector("[class]");
      POST_CLASS = "." + firstPost.classList[0];
      console.log("POST_CLASS: " + POST_CLASS);
      chrome.runtime.sendMessage("nhcmdmbjbjdchgnalicfnicjiggfdoje", { action: "find_post_class", class: POST_CLASS }, console.log);
      clearInterval(postClassInterval);
      startAdBlock();
      setInterval(startAdBlock, 5000);
      return;
    }
  }
  console.log("Feed not found");
}
let postClassInterval = setInterval(findPostClass, 1000);

function startAdBlock() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.querySelectorAll) {
            doAdBlock(node);
          }
        });
      } else if (mutation.type === "attributes") {
        if (mutation.target.nodeType === 1 && mutation.target.querySelectorAll) {
          doAdBlock(mutation.target);
        }
      }
    });
  });

  const config = {
    attributes: true,
    childList: true,
    subtree: true,
  };

  observer.observe(document, config);
  doAdBlock(document);
}

function getDirectText(element) {
  let text = "";
  if (element.childNodes.length > 0) {
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      }
    });
  }
  return text;
}

let linksPrinted = [];

function doAdBlock(node) {
  // 1: block sponsored content
  const useElements = node.querySelectorAll("use");
  for (let i = 0; i < useElements.length; i++) {
    const useElement = useElements[i];
    const link = useElement.getAttribute("xlink:href").substring(1);
    const a = useElement.closest("a");
    if (a && document.querySelector(`text[id=${link}]`).innerHTML === "Sponsored") {
      var div = a.closest("div");
      var div2 = div.closest(POST_CLASS);
      div2.style.display = "none";
    }
  }
  // 2: block suggested posts, reels
  const STRINGS = ["Suggested for you", "Reels and short videos", "Sponsored", "Marketplace", "Watch", "News", "People You May Know"];
  const TL_CLASSES = [POST_CLASS, "div:not([class])"];
  node.querySelectorAll("span").forEach(element => {
    if (STRINGS.includes(element.textContent)) {
      var div = element.closest("div");
      console.log("trying to remove", div);
      for (let i = 0; i < TL_CLASSES.length; i++) {
        var div2 = div.closest(TL_CLASSES[i]);
        if (div2) {
          div2.style.display = "none";
          break;
        }
      }
    }
  });
  // 3: block sponsored content with "Sponsored" text
  node.querySelectorAll("div").forEach(element => {
    if (getDirectText(element).includes("Sponsored")) {
      var div = element.closest("div");
      console.log("trying to remove", div);
      var div2 = div.closest(POST_CLASS);
      if (div2) div2.style.display = "none";
      else {
        div2 = div.closest("div:not([class])");
        if (div2) div2.style.display = "none";
      }
    }
  });
}