import TurndownService from "turndown";
import { parseHTML } from "linkedom";

// --- Request Handler ---

/**
 * Checks and handles Markdown (.md) requests by fetching the equivalent HTML and converting it.
 * @param {Request} request - The original fetch request.
 * @param {URL} url - The parsed URL object.
 * @param {string} pathname - The normalized request pathname.
 * @returns {Promise<Response|null>} The Markdown response if the request was handled, otherwise null.
 */
export async function handleMarkdownRequest(request, url, pathname) {
  if (!pathname.toLowerCase().endsWith(".md")) {
    return null;
  }

  const pathnameWithoutMd = pathname.slice(0, -3);
  const htmlUrl = new URL(url);
  htmlUrl.pathname = pathnameWithoutMd;

  try {
    const htmlResponse = await fetch(htmlUrl.toString(), {
      headers: request.headers,
      method: request.method,
    });

    const contentType = htmlResponse.headers.get("content-type") || "";
    if (!htmlResponse.ok || !contentType.includes("text/html")) {
      return htmlResponse;
    }

    const htmlText = await htmlResponse.text();
    const productsJson = await fetchProductsJson(request, htmlUrl, pathnameWithoutMd);

    const markdown = cleanHtmlToMarkdown(htmlText, productsJson);

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(`Error converting HTML to Markdown: ${error.message}`, {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Side-fetches collection products JSON and slices it to the first 24 items.
 */
async function fetchProductsJson(request, htmlUrl, pathnameWithoutMd) {
  if (!pathnameWithoutMd.toLowerCase().startsWith("/collections/")) {
    return null;
  }
  const jsonUrl = new URL(htmlUrl);
  jsonUrl.pathname = pathnameWithoutMd + "/products.json";
  try {
    const jsonResponse = await fetch(jsonUrl.toString(), {
      headers: request.headers,
      method: "GET",
    });
    if (jsonResponse.ok) {
      const productsJson = await jsonResponse.json();
      if (productsJson && Array.isArray(productsJson.products)) {
        productsJson.products = productsJson.products.slice(0, 24);
      }
      return productsJson;
    }
  } catch (e) {
    // Ignore json fetch error
  }
  return null;
}

// --- Main Engine ---

/**
 * Transforms raw HTML to clean, readable, LLM-friendly Markdown.
 * @param {string} htmlText - Raw HTML content.
 * @param {object} productsJson - Optional product JSON payload for collections.
 * @returns {string} Clean Markdown content.
 */
export function cleanHtmlToMarkdown(htmlText, productsJson = null) {
  const { document } = parseHTML(htmlText);

  // 1. Expand collection descriptions hidden in data-desc attributes
  expandDataDescAttributes(document);

  // 2. Inject product grid if product data is available (Shopify collections)
  injectProductGrid(document, productsJson);

  // Select the main content element (default to body/document if main doesn't exist)
  const mainElement = document.querySelector("main") || document.body || document.documentElement || document;

  // 3. Traverse and remove chrome/UI elements safely
  removeChromeElements(mainElement);

  // 4. Product list normalization: convert repetitive product blocks to HTML tables
  findAndConvertProductLists(mainElement);

  // 5. Fake heading detection and heading level normalization
  normalizeHeadings(mainElement);

  // 6. Image rules (duplicates, tracking pixels, decorative)
  cleanImages(mainElement);

  // 7. Link rules (javascript, empty, tracking params)
  cleanLinks(mainElement);

  // Clean empty columns in tables
  cleanTables(mainElement);

  // 8. Remove empty sections/elements recursively
  removeEmptyElements(mainElement);

  // 9. Convert DOM to Markdown using Turndown
  const turndownService = createTurndownService();
  const rawMarkdown = turndownService.turndown(mainElement);

  // 10. Formatting and post-processing rules
  return cleanMarkdown(rawMarkdown);
}

// --- Helper Steps ---

function expandDataDescAttributes(document) {
  const descElements = Array.from(document.querySelectorAll("[data-desc]"));
  descElements.forEach(el => {
    const dataDesc = el.getAttribute("data-desc");
    if (dataDesc && el.textContent.trim() === "") {
      try {
        el.innerHTML = dataDesc;
      } catch (e) {
        // Ignore parsing errors
      }
    }
  });
}

function injectProductGrid(document, productsJson) {
  if (!productsJson || !Array.isArray(productsJson.products) || productsJson.products.length === 0) {
    return;
  }

  const slicedProducts = productsJson.products.slice(0, 24);
  const formatPrice = (val) => {
    if (!val) return "";
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    return num.toLocaleString("vi-VN") + "đ";
  };

  const productsHtml = `
    <div class="product-list-container">
      <div class="product-grid">
        ${slicedProducts.map(p => {
          const variant = p.variants && p.variants[0];
          const price = variant ? formatPrice(variant.price) : "";
          const originalPrice = variant && variant.compare_at_price ? formatPrice(variant.compare_at_price) : "";
          const image = p.images && p.images[0] ? p.images[0].src : "";
          const status = p.available ? "Còn hàng" : "Hết hàng";
          return `
            <div class="product-item">
              <img class="product-image" src="${image}" alt="${p.title}" />
              <a class="product-name" href="/products/${p.handle}">${p.title}</a>
              <span class="product-price">${price}</span>
              ${originalPrice ? `<span class="original-price">${originalPrice}</span>` : ""}
              <span class="product-status">${status}</span>
            </div>
          `;
        }).join("")}
      </div>
    </div>
  `;

  const mainElement = document.querySelector("main") || document.body || document.documentElement || document;
  const descEl = mainElement.querySelector(".collection-desc") || mainElement.querySelector(".collection-description");

  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = productsHtml;
    const productGridNode = tempDiv.firstElementChild;

    if (productGridNode) {
      if (descEl) {
        descEl.parentNode.insertBefore(productGridNode, descEl);
      } else {
        mainElement.appendChild(productGridNode);
      }
    }
  } catch (e) {
    // Ignore injection error
  }
}

function removeChromeElements(mainElement) {
  const traverseAndClean = (element) => {
    Array.from(element.children).forEach(child => {
      traverseAndClean(child);
    });
    if (element !== mainElement && shouldRemoveElement(element)) {
      element.remove();
    }
  };
  traverseAndClean(mainElement);
}

// --- Specific Cleanup Rules ---

function shouldRemoveElement(el) {
  const tagName = el.tagName.toLowerCase();

  // Always remove structural chrome tags & standard input controls
  if (["nav", "aside", "header", "footer", "form", "button", "select", "textarea", "input", "option", "label", "noscript", "iframe", "object", "embed", "script", "style", "time"].includes(tagName)) {
    return true;
  }

  // Remove hidden elements (elements with display: none in style)
  const style = el.getAttribute("style") || "";
  if (style.toLowerCase().replace(/\s+/g, "").includes("display:none")) {
    return true;
  }

  // Remove element by role
  const role = (el.getAttribute("role") || "").toLowerCase();
  if (["banner", "navigation", "contentinfo", "search", "searchbox", "button", "dialog", "alertdialog"].includes(role)) {
    return true;
  }

  const className = (el.getAttribute("class") || "").toLowerCase();
  const idName = (el.getAttribute("id") || "").toLowerCase();

  // Protect important page wrapper/content elements from accidental removal
  const isProtected = className.includes("entry-content") ||
                      className.includes("article-body") ||
                      className.includes("content-page") ||
                      className.includes("article-content") ||
                      className.includes("product-grid") ||
                      className.includes("product-list") ||
                      className.includes("collection-desc") ||
                      className.includes("author-box") ||
                      className.includes("main-content");
  if (isProtected) {
    return false;
  }

  // Safely match keywords using word boundary rules to prevent false positives like "-ad" in "lazyload-addclass"
  const matchesKeyword = (str) => {
    if (!str) return false;
    const patterns = [
      /\bcookie\b/, /\bconsent\b/, /\bgdpr\b/,
      /\bnewsletter\b/, /\bsubscribe\b/,
      /\bsocial\b/, /\bshare\b/, /\bsharing\b/,
      /\bads?\b/, /\badvertisement\b/, /\bsponsored\b/,
      /\brelated-products\b/, /\brelated-posts\b/, /\brelated-articles\b/,
      /\brecommend-products\b/, /\brecommended-products\b/, /\brecommend-posts\b/,
      /\brecently-viewed\b/, /\brecent-products\b/, /\brecent-posts\b/,
      /\bsidebars?\b/,
      /\bbreadcrumbs?\b/,
      /\bpaginations?\b/, /\bpagers?\b/,
      /\bsearch\b/,
      /\bfilters?\b/, /\bsorts?\b/, /\bsorting\b/,
      /\bdropdowns?\b/,
      /\btabs?\b/, /\btab-lists?\b/,
      /\bpopups?\b/, /\bmodals?\b/, /\btoasts?\b/, /\btooltips?\b/, /\bpopovers?\b/, /\bnotifications?\b/, /\balerts?\b/,
      /\blogin\b/, /\bregister\b/, /\bsignups?\b/, /\bsignins?\b/,
      /\bwidgets?\b/,
      /\btime-post\b/, /\bdate-time\b/, /\bpublish-date\b/, /\bpost-date\b/
    ];
    return patterns.some(p => p.test(str));
  };

  if (matchesKeyword(className) || matchesKeyword(idName)) {
    return true;
  }

  // Remove link buttons (a tags styled as buttons)
  if (tagName === "a") {
    const classWords = className.split(/\s+/);
    const isButtonClass = classWords.some(w => w === "btn" || w === "button" || w === "cta" || w.startsWith("btn-") || w.startsWith("button-") || w.startsWith("cta-"));
    if (isButtonClass) {
      return true;
    }
  }

  // Remove pagination count metadata and recently viewed products title text
  const text = el.textContent.trim();
  if (text.length < 100) {
    if (/^hiển thị \d+ trên \d+/i.test(text)) {
      return true;
    }
    if (text === "Sản phẩm vừa xem" || text === "Sản phẩm đã xem" || text === "Sản phẩm vừa xem:") {
      return true;
    }
  }

  return false;
}

// --- Product List Conversion to Markdown Tables ---

function findAndConvertProductLists(rootElement) {
  const allElements = Array.from(rootElement.querySelectorAll("*"));
  const replacedContainers = new Set();
  const doc = rootElement.ownerDocument || rootElement;

  allElements.forEach(container => {
    if (replacedContainers.has(container)) return;

    const children = Array.from(container.children);
    if (children.length < 2) return;

    // Group children by class or tag to find repetitive patterns
    const groups = groupChildrenByClassOrTag(children);

    Object.keys(groups).forEach(key => {
      const items = groups[key];
      if (items.length < 2) return;

      const parsedItems = items.map(item => extractItemFields(item));

      // Compute density: require at least 50% cell occupancy across all rows
      const allFieldNames = new Set();
      let filledCells = 0;
      parsedItems.forEach(item => {
        Object.keys(item).forEach(f => allFieldNames.add(f));
        filledCells += Object.keys(item).length;
      });

      const totalCells = items.length * allFieldNames.size;
      const density = totalCells > 0 ? filledCells / totalCells : 0;
      if (density < 0.5) return;

      const hasProductFields = Array.from(allFieldNames).some(f =>
        ["Product", "Image", "Price", "Original Price", "Material", "Availability", "Description"].includes(f)
      );

      const nonGenericHeaders = Array.from(allFieldNames).filter(f =>
        !["p", "div", "span", "strong", "b", "em", "i", "a", "li", "ul", "ol"].includes(f.toLowerCase())
      );

      if (nonGenericHeaders.length >= 2 && (hasProductFields || nonGenericHeaders.length > 2)) {
        // Slice items and parsed items to a maximum of 24
        const itemsToConvert = items.slice(0, 24);
        const excessItems = items.slice(24);
        excessItems.forEach(item => item.remove());

        const slicedParsedItems = parsedItems.slice(0, 24);

        // Define column ordering
        const headersOrder = ["Product", "Image", "Price", "Original Price", "Material", "Availability", "Description"];
        const headers = [];

        headersOrder.forEach(h => {
          if (allFieldNames.has(h)) {
            headers.push(h);
            allFieldNames.delete(h);
          }
        });
        Array.from(allFieldNames).forEach(h => headers.push(h));

        // Build the HTML Table
        const table = buildHtmlTable(doc, headers, slicedParsedItems);

        const firstItem = itemsToConvert[0];
        firstItem.parentNode.insertBefore(table, firstItem);
        itemsToConvert.forEach(item => item.remove());

        replacedContainers.add(container);
      }
    });
  });
}

function groupChildrenByClassOrTag(children) {
  const groups = {};
  children.forEach(child => {
    const className = (child.getAttribute("class") || "").trim();
    const tagName = child.tagName.toLowerCase();

    // Skip generic children that don't have classes
    if (!className && ["p", "span", "a", "strong", "b", "em", "i"].includes(tagName)) {
      return;
    }

    const key = className || tagName;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(child);
  });
  return groups;
}

function extractItemFields(item) {
  const fields = {};
  const descendants = Array.from(item.querySelectorAll("*"));
  descendants.unshift(item);

  descendants.forEach(el => {
    const tagName = el.tagName.toLowerCase();

    // Handle image elements
    if (tagName === "img") {
      const src = el.getAttribute("src");
      const alt = el.getAttribute("alt") || "Product Image";
      if (src) {
        fields["Image"] = `![${alt}](${src})`;
      }
      return;
    }

    const textNodeChild = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.textContent.trim() !== "");
    if (!textNodeChild) return;

    let text = el.textContent.trim();
    if (tagName === "a") {
      const href = el.getAttribute("href");
      if (href) {
        text = `[${text}](${href})`;
      }
    }

    // Handle colon-separated key/value fields (e.g. "Chất liệu: Vàng 18K")
    if (text.includes(":")) {
      const parts = text.split(":");
      const fieldLabel = parts[0].trim();
      const fieldValue = parts.slice(1).join(":").trim();
      if (fieldLabel.length > 0 && fieldLabel.length < 30 && fieldValue.length > 0) {
        fields[fieldLabel] = fieldValue;
        return;
      }
    }

    // Extract class-based or tag-based field name
    let fieldName = "";
    const className = el.getAttribute("class") || "";
    if (className) {
      fieldName = className.trim().split(/\s+/)[0];
    } else {
      fieldName = tagName;
    }

    // Normalize field name to common standard headers
    const normalizedField = normalizeFieldName(fieldName);

    if (!fields[normalizedField]) {
      fields[normalizedField] = text;
    }
  });

  return fields;
}

function normalizeFieldName(fieldName) {
  const lower = fieldName.toLowerCase();
  if (lower.includes("name") || lower.includes("title")) {
    return "Product";
  }
  if (lower.includes("compare") || lower.includes("original") || lower.includes("old") || lower.includes("goc")) {
    return "Original Price";
  }
  if (lower.includes("price")) {
    return "Price";
  }
  if (lower.includes("material")) {
    return "Material";
  }
  if (lower.includes("status") || lower.includes("availability") || lower.includes("stock")) {
    return "Availability";
  }
  if (lower.includes("desc")) {
    return "Description";
  }
  return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
}

function buildHtmlTable(doc, headers, slicedParsedItems) {
  const table = doc.createElement("table");

  const thead = doc.createElement("thead");
  const headerRow = doc.createElement("tr");
  headers.forEach(h => {
    const th = doc.createElement("th");
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = doc.createElement("tbody");
  slicedParsedItems.forEach(item => {
    const tr = doc.createElement("tr");
    headers.forEach(h => {
      const td = doc.createElement("td");
      td.textContent = item[h] || "";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

// --- Headings Hierarchy and Fake Heading Detection ---

function normalizeHeadings(rootElement) {
  const doc = rootElement.ownerDocument || rootElement;

  // 1. Detect fake headings (paragraphs that are completely bold)
  const pElements = Array.from(rootElement.querySelectorAll("p, div"));
  pElements.forEach(p => {
    const trimmedText = p.textContent.trim();
    if (trimmedText.length === 0 || trimmedText.length > 150) {
      return;
    }

    const children = Array.from(p.childNodes);
    const nonCommentChildren = children.filter(node => node.nodeType !== 8);

    let isBold = false;
    if (nonCommentChildren.length === 1) {
      const child = nonCommentChildren[0];
      if (child.nodeType === 1) {
        const tagName = child.tagName.toLowerCase();
        if (tagName === "strong" || tagName === "b") {
          isBold = true;
        }
      }
    } else if (nonCommentChildren.length > 0) {
      const nonSpaceTextNodes = children.filter(node => node.nodeType === 3 && node.textContent.trim() !== "");
      const elementNodes = children.filter(node => node.nodeType === 1);
      if (nonSpaceTextNodes.length === 0 && elementNodes.length > 0 && elementNodes.every(node => {
        const tag = node.tagName.toLowerCase();
        return tag === "strong" || tag === "b";
      })) {
        isBold = true;
      }
    }

    if (isBold) {
      const h2 = doc.createElement("h2");
      h2.textContent = trimmedText;
      p.parentNode.replaceChild(h2, p);
    }
  });

  // 2. Adjust heading levels to prevent hierarchy skipping
  const headings = Array.from(rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  const stack = [];
  headings.forEach(h => {
    const originalLevel = parseInt(h.tagName[1], 10);

    while (stack.length > 0 && stack[stack.length - 1].originalLevel >= originalLevel) {
      stack.pop();
    }

    let adjustedLevel;
    if (stack.length === 0) {
      adjustedLevel = 1;
    } else {
      adjustedLevel = stack[stack.length - 1].adjustedLevel + 1;
    }

    stack.push({ originalLevel, adjustedLevel });

    const newTag = `h${adjustedLevel}`;
    if (h.tagName.toLowerCase() !== newTag) {
      const newHeading = doc.createElement(newTag);
      while (h.firstChild) {
        newHeading.appendChild(h.firstChild);
      }
      for (let i = 0; i < h.attributes.length; i++) {
        const attr = h.attributes[i];
        newHeading.setAttribute(attr.name, attr.value);
      }
      h.parentNode.replaceChild(newHeading, h);
    }
  });

  // 3. Unwrap any bold tags (strong, b) inside all headings to prevent bold markers in headings
  const finalHeadings = Array.from(rootElement.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  finalHeadings.forEach(h => {
    const boldEls = Array.from(h.querySelectorAll("strong, b"));
    boldEls.forEach(bold => {
      const parent = bold.parentNode;
      while (bold.firstChild) {
        parent.insertBefore(bold.firstChild, bold);
      }
      bold.remove();
    });
  });
}

// --- Images Optimization ---

function cleanImages(rootElement) {
  const imgs = Array.from(rootElement.querySelectorAll("img"));
  const seenImageUrls = new Set();

  imgs.forEach(img => {
    // Restore lazy loaded src
    const lazySrc = img.getAttribute("data-src") || 
                    img.getAttribute("data-lazy") || 
                    img.getAttribute("data-lazy-src") || 
                    img.getAttribute("data-original") || 
                    img.getAttribute("srcset") || 
                    img.getAttribute("data-srcset");
    if (lazySrc) {
      let realSrc = lazySrc.trim();
      if (realSrc.includes(" ")) {
        realSrc = realSrc.split(/\s+/)[0];
      }
      img.setAttribute("src", realSrc);
    }

    const src = (img.getAttribute("src") || "").trim();
    const alt = (img.getAttribute("alt") || "").trim();
    const width = img.getAttribute("width");
    const height = img.getAttribute("height");

    if (!src || src.startsWith("data:image/")) {
      img.remove();
      return;
    }

    // Remove tracking pixels
    const isPixel = src.includes("pixel") || src.includes("tracker") ||
                    width === "1" || height === "1" ||
                    alt.toLowerCase().includes("pixel") || alt.toLowerCase().includes("tracker") ||
                    src.includes("spacer");
    if (isPixel) {
      img.remove();
      return;
    }

    // Remove decorative images
    const isDecorative = !alt || alt.toLowerCase().match(/^(logo|icon|bullet|divider|line|spacer|btn|button|social|facebook|twitter|instagram|youtube|linkedin|tiktok|pinterest|nav|menu)$/);
    const filename = src.split("/").pop().toLowerCase();
    const isDecorativeFilename = filename.includes("logo") || filename.includes("icon") ||
                                 filename.includes("bullet") || filename.includes("divider") ||
                                 filename.includes("spacer") || filename.includes("line") ||
                                 filename.includes("social") || filename.match(/^(fb|tw|ig|yt|li|tk|pin)\./);

    if (!alt && (isDecorative || isDecorativeFilename)) {
      img.remove();
      return;
    }

    // Remove duplicate images
    const normalizedUrl = src.split("?")[0];
    if (seenImageUrls.has(normalizedUrl)) {
      img.remove();
      return;
    }
    seenImageUrls.add(normalizedUrl);
  });
}

// --- Links Optimization ---

function cleanLinks(rootElement) {
  const links = Array.from(rootElement.querySelectorAll("a"));
  links.forEach(a => {
    const href = (a.getAttribute("href") || "").trim();

    if (!href || href.toLowerCase().startsWith("javascript:")) {
      a.remove();
      return;
    }

    // Strip tracking parameters
    try {
      const baseUrl = "https://dummy.com";
      const parsedUrl = new URL(href, baseUrl);
      const params = Array.from(parsedUrl.searchParams.keys());
      const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid", "msclkid"];
      let changed = false;

      params.forEach(param => {
        if (trackingParams.includes(param.toLowerCase())) {
          parsedUrl.searchParams.delete(param);
          changed = true;
        }
      });

      if (changed) {
        if (href.startsWith("/") || href.startsWith(".") || !href.includes(":")) {
          const relativeHref = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
          a.setAttribute("href", relativeHref);
        } else {
          a.setAttribute("href", parsedUrl.toString());
        }
      }
    } catch (e) {
      // Ignore invalid URL
    }

    // Remove empty links, but preserve alt text from wrapped images if available
    if (a.textContent.trim() === "") {
      const img = a.querySelector("img");
      if (img && img.getAttribute("alt")) {
        a.textContent = img.getAttribute("alt");
      } else {
        a.remove();
      }
    }
  });
}

// --- Empty Elements Optimization ---

function removeEmptyElements(element) {
  Array.from(element.children).forEach(child => {
    removeEmptyElements(child);
  });

  const tagName = element.tagName.toLowerCase();
  const keepTags = ["img", "br", "hr", "iframe", "video", "audio", "table", "th", "td", "tr"];
  if (keepTags.includes(tagName)) {
    return;
  }

  if (element.children.length === 0 && element.textContent.trim() === "") {
    element.remove();
  }
}

// --- Table Columns Optimization ---

function cleanTables(rootElement) {
  const tables = Array.from(rootElement.querySelectorAll("table"));
  tables.forEach(table => {
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return;
    
    // Find the maximum number of columns
    let maxCols = 0;
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll("th, td"));
      if (cells.length > maxCols) {
        maxCols = cells.length;
      }
    });
    
    // Check which columns are entirely empty (only whitespace or &nbsp;)
    const emptyCols = [];
    for (let c = 0; c < maxCols; c++) {
      let isColumnEmpty = true;
      for (let r = 0; r < rows.length; r++) {
        const cells = Array.from(rows[r].querySelectorAll("th, td"));
        const cell = cells[c];
        if (cell) {
          const text = cell.textContent.trim().replace(/\u00A0/g, ""); // replace &nbsp; (non-breaking space)
          if (text !== "") {
            isColumnEmpty = false;
            break;
          }
        }
      }
      if (isColumnEmpty) {
        emptyCols.push(c);
      }
    }
    
    // Remove the empty columns (in reverse order to avoid index shift)
    for (let i = emptyCols.length - 1; i >= 0; i--) {
      const colIdx = emptyCols[i];
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        const cell = cells[colIdx];
        if (cell) {
          cell.remove();
        }
      });
    }
  });
}

// --- Turndown Service Setup ---

function createTurndownService() {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletMarker: "-",
    codeBlockStyle: "fenced"
  });

  turndownService.addRule("author-box", {
    filter: function (node) {
      return node.nodeType === 1 && (node.getAttribute("class") || "").includes("author-box");
    },
    replacement: function (content, node) {
      const imgEl = node.querySelector(".author-box__avatar img");
      const nameEl = node.querySelector(".author-box__name");
      const roleEl = node.querySelector(".author-box__role");
      const bioEl = node.querySelector(".author-box__bio");
      
      const avatarSrc = imgEl ? imgEl.getAttribute("src") : "";
      const avatarAlt = imgEl ? (imgEl.getAttribute("alt") || "Author Avatar") : "Author Avatar";
      
      let nameText = nameEl ? nameEl.textContent.trim() : "";
      const roleText = roleEl ? roleEl.textContent.trim() : "";
      const bioText = bioEl ? bioEl.textContent.trim() : "";
      
      if (nameText && !nameText.startsWith("Author:") && !nameText.startsWith("Tác giả:")) {
        nameText = "Author: " + nameText;
      }
      const titleLine = roleText ? `${nameText} - ${roleText}` : nameText;
      
      const parts = [];
      parts.push("### Thông tin tác giả");
      if (avatarSrc) {
        parts.push(`> ![${avatarAlt}](${avatarSrc})`);
      }
      parts.push(`> **${titleLine}**`);
      if (bioText) {
        parts.push(`> ${bioText}`);
      }
      
      return "\n\n" + parts.join("\n") + "\n\n";
    }
  });

  const convertCellToMarkdown = (cell) => {
    return Array.from(cell.childNodes)
      .map(child => {
        if (child.nodeType === 3) {
          return child.textContent;
        }
        return turndownService.turndown(child);
      })
      .join("")
      .trim()
      .replace(/\n/g, " ");
  };

  turndownService.addRule("table", {
    filter: "table",
    replacement: function (content, node) {
      const rows = Array.from(node.querySelectorAll("tr"));
      if (rows.length === 0) return "";

      const markdownRows = [];
      const firstRowCells = Array.from(rows[0].querySelectorAll("th, td"));
      const headerCells = firstRowCells.map(convertCellToMarkdown);

      markdownRows.push("| " + headerCells.join(" | ") + " |");
      markdownRows.push("| " + headerCells.map(() => "---").join(" | ") + " |");

      for (let i = 1; i < rows.length; i++) {
        const cells = Array.from(rows[i].querySelectorAll("th, td")).map(convertCellToMarkdown);
        while (cells.length < headerCells.length) {
          cells.push("");
        }
        markdownRows.push("| " + cells.slice(0, headerCells.length).join(" | ") + " |");
      }

      return "\n\n" + markdownRows.join("\n") + "\n\n";
    }
  });

  return turndownService;
}

// --- Post-processing Markdown Formatting ---

function cleanMarkdown(markdown) {
  let lines = markdown.split("\n");
  lines = lines.map(line => line.trimEnd());

  let content = lines.join("\n");
  content = content.replace(/\n{3,}/g, "\n\n");

  const finalLines = [];
  const processedLines = content.split("\n");

  for (let i = 0; i < processedLines.length; i++) {
    const line = processedLines[i];
    const isHeading = /^#{1,6}\s/.test(line);
    const isTable = /^\|.*\|$/.test(line);

    if (isHeading) {
      if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== "") {
        finalLines.push("");
      }
      finalLines.push(line);
      if (i < processedLines.length - 1 && processedLines[i + 1] !== "") {
        finalLines.push("");
      }
    } else if (isTable) {
      if (finalLines.length > 0 && finalLines[finalLines.length - 1] !== "" && !/^\|.*\|$/.test(finalLines[finalLines.length - 1])) {
        finalLines.push("");
      }
      finalLines.push(line);
      if (i < processedLines.length - 1 && processedLines[i + 1] !== "" && !/^\|.*\|$/.test(processedLines[i + 1])) {
        finalLines.push("");
      }
    } else {
      finalLines.push(line);
    }
  }

  let result = finalLines.join("\n");
  result = result.replace(/\n{3,}/g, "\n\n");
  return result.trim() + "\n";
}
