/**
 * Single source of truth for every endpoint reference page.
 * Each entry powers one page at /docs/endpoints/<slug>.
 */
export type EndpointParam = {
  field: string;
  type: string;
  def?: string;
  desc: string;
  required?: boolean;
};

export type EndpointError = {
  status: string;
  code: string;
  desc: string;
};

export type EndpointSpec = {
  slug: string;
  verb: "GET" | "POST";
  path: string;
  group: "Core" | "Batch" | "Cutout" | "Composition" | "Enhancement" | "Utility";
  title: string;
  lede: string;
  params?: EndpointParam[];
  responseHeaders?: string;
  responseBody?: string;
  errors?: EndpointError[];
  notes?: string[];
  curl?: string;
  node?: string;
  python?: string;
  next?: { slug: string; label: string };
  prev?: { slug: string; label: string };
};

const COMMON_FILE_PARAM: EndpointParam = {
  field: "file",
  type: "file",
  desc: "Image to process. JPG, PNG, WebP, HEIC. Up to 10 MB and 4096×4096.",
  required: true,
};

const COMMON_FORMAT_PARAM: EndpointParam = {
  field: "format",
  type: "string",
  def: "png",
  desc: "Output format — png (with alpha) or webp.",
};

const COMMON_QUALITY_PARAM: EndpointParam = {
  field: "quality",
  type: "int 1-100",
  def: "92",
  desc: "JPEG/WebP quality. Ignored for PNG.",
};

const COMMON_ERRORS: EndpointError[] = [
  { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
  { status: "402", code: "payment_required", desc: "Free tier exhausted. Add a card to continue." },
  { status: "413", code: "payload_too_large", desc: "Image exceeds 10 MB or 4096×4096." },
  { status: "422", code: "no_subject_detected", desc: "Foreground could not be isolated from background." },
  { status: "429", code: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
  { status: "500", code: "internal_error", desc: "Something broke on our side. Include request_id when reporting." },
];

const COMMON_HEADERS = `HTTP/1.1 200 OK
content-type: image/png
content-length: 254312
x-knockout-latency: 184
x-knockout-model: BiRefNet
x-ratelimit-limit: 60
x-ratelimit-remaining: 59`;

function curlFor(path: string, extra: string = ""): string {
  return `curl -X POST "https://useknockout--api.modal.run${path}" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@cat.jpg" \\${extra ? "\n  " + extra + " \\" : ""}
  -o out.png`;
}

export const ENDPOINTS: EndpointSpec[] = [
  // ============== CORE ==============
  {
    slug: "remove",
    verb: "POST",
    path: "/remove",
    group: "Core",
    title: "Remove background",
    lede:
      "Upload an image and get back a transparent PNG or WebP. Edges are cleaned via closed-form foreground matting — no halos, no fringing.",
    params: [
      COMMON_FILE_PARAM,
      COMMON_FORMAT_PARAM,
      COMMON_QUALITY_PARAM,
      {
        field: "matting",
        type: "string",
        def: "closed-form",
        desc: "Edge cleanup algorithm. Options: closed-form, none.",
      },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary PNG with alpha channel>",
    errors: COMMON_ERRORS,
    notes: [
      "The model runs on a Modal L4 GPU. Warm calls are ~200ms. First request after a cold container is 60–90s while weights load — Modal autoscales to zero, that's the trade-off for $0 idle cost. Pin `keep_warm=1` to eliminate cold starts.",
      "Images are processed in-memory and discarded after the response is returned.",
      "For batch workflows, fan out with Promise.all in Node or asyncio.gather in Python — or use /remove-batch.",
    ],
    curl: curlFor("/remove", `-F "format=png"`),
    next: { slug: "remove-url", label: "POST /remove-url" },
  },
  {
    slug: "remove-url",
    verb: "POST",
    path: "/remove-url",
    group: "Core",
    title: "Remove background from URL",
    lede:
      "Same as /remove but the source image lives at a URL we fetch on your behalf. Skip the upload step when the image is already public.",
    params: [
      {
        field: "url",
        type: "string",
        desc: "Public URL of the source image. HTTPS required. ≤10 MB after fetch.",
        required: true,
      },
      COMMON_FORMAT_PARAM,
      COMMON_QUALITY_PARAM,
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary PNG with alpha channel>",
    errors: [
      ...COMMON_ERRORS,
      { status: "424", code: "fetch_failed", desc: "We couldn't fetch the source URL. Check it's public and HTTPS." },
    ],
    notes: [
      "We fetch via HTTP GET with a 10s timeout, no redirects beyond the first.",
      "Fetched bytes count against your quota same as direct uploads.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/remove-url" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/cat.jpg","format":"png"}' \\
  -o out.png`,
    prev: { slug: "remove", label: "POST /remove" },
    next: { slug: "replace-bg", label: "POST /replace-bg" },
  },
  {
    slug: "replace-bg",
    verb: "POST",
    path: "/replace-bg",
    group: "Core",
    title: "Replace background",
    lede:
      "Cut out the subject and composite it onto a new background — solid color, hex, or another image. One call instead of two.",
    params: [
      COMMON_FILE_PARAM,
      {
        field: "bg_color",
        type: "string",
        desc: "Hex color (e.g. #FF5733) or named color (e.g. red, transparent).",
      },
      {
        field: "bg_url",
        type: "string",
        desc: "URL of a background image. Composited beneath the subject. Mutually exclusive with bg_color.",
      },
      {
        field: "fit",
        type: "string",
        def: "cover",
        desc: "How the bg image fits behind subject. cover, contain, stretch.",
      },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary image — opaque PNG/JPG/WebP>",
    errors: COMMON_ERRORS,
    notes: [
      "Provide exactly one of bg_color or bg_url.",
      "If bg_url is provided, response format defaults to JPEG since alpha is no longer needed.",
    ],
    curl: curlFor("/replace-bg", `-F "bg_color=#0B0D0E"`),
    prev: { slug: "remove-url", label: "POST /remove-url" },
    next: { slug: "remove-batch", label: "POST /remove-batch" },
  },

  // ============== BATCH ==============
  {
    slug: "remove-batch",
    verb: "POST",
    path: "/remove-batch",
    group: "Batch",
    title: "Remove background, batch",
    lede:
      "Process up to 10 images in a single multipart request. Returns a JSON manifest with one entry per input + signed download URLs valid for 24 hours.",
    params: [
      {
        field: "files[]",
        type: "file[]",
        desc: "Array of image files. Up to 10. Each ≤10 MB. JPG/PNG/WebP/HEIC.",
        required: true,
      },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json
x-knockout-latency: 1842
x-knockout-model: BiRefNet`,
    responseBody: `{
  "results": [
    { "filename": "cat.jpg", "url": "https://...signed.../cat.png", "status": 200 },
    { "filename": "dog.jpg", "url": "https://...signed.../dog.png", "status": 200 }
  ],
  "request_id": "req_01HK..."
}`,
    errors: [
      ...COMMON_ERRORS,
      { status: "413", code: "payload_too_large", desc: "Total batch >50 MB or any single file >10 MB." },
      { status: "400", code: "too_many_files", desc: "Maximum 10 files per batch." },
    ],
    notes: [
      "Files process in parallel. Total response time ≈ slowest single file + 100ms overhead.",
      "Signed URLs are R2-backed and self-expire after 24h. Download or rehost.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/remove-batch" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "files=@cat.jpg" -F "files=@dog.jpg" -F "files=@bird.jpg"`,
    prev: { slug: "replace-bg", label: "POST /replace-bg" },
    next: { slug: "remove-batch-url", label: "POST /remove-batch-url" },
  },
  {
    slug: "remove-batch-url",
    verb: "POST",
    path: "/remove-batch-url",
    group: "Batch",
    title: "Remove background, batch by URL",
    lede:
      "Same shape as /remove-batch but each input is a URL we fetch. Useful when you have a list of S3/CDN-hosted images you want processed.",
    params: [
      {
        field: "urls[]",
        type: "string[]",
        desc: "Array of HTTPS URLs. Up to 10. Each fetched image ≤10 MB.",
        required: true,
      },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json
x-knockout-latency: 2104
x-knockout-model: BiRefNet`,
    responseBody: `{
  "results": [
    { "url_in": "https://...", "url_out": "https://...signed.../...", "status": 200 },
    { "url_in": "https://...", "error": { "code": "fetch_failed" }, "status": 424 }
  ],
  "request_id": "req_01HK..."
}`,
    errors: [
      ...COMMON_ERRORS,
      { status: "424", code: "fetch_failed", desc: "One or more source URLs failed to fetch — see results array." },
    ],
    notes: [
      "Per-URL errors don't fail the whole batch. Each result row reports its own status.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/remove-batch-url" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"urls":["https://example.com/a.jpg","https://example.com/b.jpg"]}'`,
    prev: { slug: "remove-batch", label: "POST /remove-batch" },
    next: { slug: "mask", label: "POST /mask" },
  },

  // ============== CUTOUT VARIANTS ==============
  {
    slug: "mask",
    verb: "POST",
    path: "/mask",
    group: "Cutout",
    title: "Alpha matte only",
    lede:
      "Returns the grayscale alpha matte — black background, white subject, soft gradient on edges. Drop into your own compositing pipeline (Photoshop, OpenCV, ffmpeg).",
    params: [COMMON_FILE_PARAM, { field: "format", type: "string", def: "png", desc: "Output format. png or jpg." }],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 178`,
    responseBody: "<binary grayscale PNG/JPG, single-channel>",
    errors: COMMON_ERRORS,
    notes: [
      "Use this when you want the matte but plan to do your own compositing — for example, applying a custom feather or threshold.",
      "Output is single-channel grayscale. Some image libraries convert to RGB on load — explicitly read as L mode.",
    ],
    curl: curlFor("/mask"),
    prev: { slug: "remove-batch-url", label: "POST /remove-batch-url" },
    next: { slug: "sticker", label: "POST /sticker" },
  },
  {
    slug: "sticker",
    verb: "POST",
    path: "/sticker",
    group: "Cutout",
    title: "Die-cut sticker with outline",
    lede:
      "Cut out the subject and add a configurable outline — iMessage/WhatsApp/Telegram-ready. Perfect for sticker packs and chat apps.",
    params: [
      COMMON_FILE_PARAM,
      {
        field: "stroke_width",
        type: "int 0-100",
        def: "16",
        desc: "Outline thickness in pixels. 0 = no outline (same as /remove).",
      },
      {
        field: "stroke_color",
        type: "string",
        def: "#FFFFFF",
        desc: "Hex color of the outline.",
      },
      {
        field: "padding",
        type: "int",
        def: "32",
        desc: "Transparent padding in pixels around the outlined subject.",
      },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary PNG with alpha + outline>",
    errors: COMMON_ERRORS,
    curl: curlFor("/sticker", `-F "stroke_width=24" -F "stroke_color=#FFFFFF"`),
    prev: { slug: "mask", label: "POST /mask" },
    next: { slug: "outline", label: "POST /outline" },
  },
  {
    slug: "outline",
    verb: "POST",
    path: "/outline",
    group: "Cutout",
    title: "Thin colored outline",
    lede:
      "Subject silhouette traced with a thin colored stroke on transparent background. Useful for highlight overlays, shop badges, and design treatments.",
    params: [
      COMMON_FILE_PARAM,
      { field: "color", type: "string", def: "#57C985", desc: "Hex stroke color." },
      { field: "width", type: "int 1-20", def: "3", desc: "Stroke thickness in pixels." },
      { field: "fill", type: "boolean", def: "false", desc: "If true, fill the silhouette interior with the color." },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary PNG with stroke + transparent fill>",
    errors: COMMON_ERRORS,
    curl: curlFor("/outline", `-F "color=#57C985" -F "width=4"`),
    prev: { slug: "sticker", label: "POST /sticker" },
    next: { slug: "smart-crop", label: "POST /smart-crop" },
  },
  {
    slug: "smart-crop",
    verb: "POST",
    path: "/smart-crop",
    group: "Cutout",
    title: "Auto-crop to subject bounds",
    lede:
      "Tight bounding box around the subject. Optional padding. Useful for thumbnails, e-commerce tiles, and uniform aspect ratios across product shots.",
    params: [
      COMMON_FILE_PARAM,
      { field: "padding", type: "int", def: "8", desc: "Pixels of padding around the detected subject bounds." },
      {
        field: "aspect",
        type: "string",
        desc: "Force a specific output aspect ratio. Examples: 1:1, 4:5, 16:9.",
      },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary cropped image>",
    errors: COMMON_ERRORS,
    notes: [
      "If aspect is provided, padding is computed to satisfy the ratio. Subject stays centered.",
      "Pair with /remove first if you want a transparent crop instead of an opaque one.",
    ],
    curl: curlFor("/smart-crop", `-F "aspect=1:1" -F "padding=16"`),
    prev: { slug: "outline", label: "POST /outline" },
    next: { slug: "silhouette", label: "POST /silhouette" },
  },
  {
    slug: "silhouette",
    verb: "POST",
    path: "/silhouette",
    group: "Cutout",
    title: "Two-tone silhouette portrait",
    lede:
      "Subject filled with one solid color, background filled with another. Apple Music / Spotify avatar aesthetic. Reuses BiRefNet's mask path — no extra model load.",
    params: [
      COMMON_FILE_PARAM,
      {
        field: "subject_color",
        type: "string",
        def: "#7C3AED",
        desc: "Hex color for the subject fill. Default is purple.",
      },
      {
        field: "bg_color",
        type: "string",
        def: "#FFFFFF",
        desc: "Hex color for the background fill. Default is white.",
      },
      {
        field: "format",
        type: "string",
        def: "png",
        desc: "Output format — png, webp, or jpg.",
      },
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 210
x-knockout-model: BiRefNet`,
    responseBody: "<binary silhouette image, same dimensions as input>",
    errors: [
      { status: "400", code: "invalid_image", desc: "Invalid image, unsupported format, or decode failure." },
      { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
      { status: "403", code: "forbidden", desc: "Invalid bearer token." },
      { status: "413", code: "payload_too_large", desc: "Image exceeds 10 MB or 4096×4096." },
      { status: "429", code: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
      { status: "500", code: "silhouette_failed", desc: "Silhouette generation failed or produced no output." },
    ],
    notes: [
      "Reuses BiRefNet's mask path — same warm latency as /mask (~150–300ms).",
      "Use cases: stylized profile pictures, podcast cover art, anonymized portraits, branding placeholders, social media avatar generators.",
      "Color inputs are valid hex strings — 3-digit (#FFF) or 6-digit (#FFFFFF) with or without the # prefix.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/silhouette" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@portrait.jpg" \\
  -F "subject_color=#1E2960" \\
  -F "bg_color=#F0857C" \\
  -o silhouette.png`,
    prev: { slug: "smart-crop", label: "POST /smart-crop" },
    next: { slug: "inpaint", label: "POST /inpaint" },
  },
  {
    slug: "inpaint",
    verb: "POST",
    path: "/inpaint",
    group: "Cutout",
    title: "Inpaint / erase region",
    lede:
      "LaMa-based image inpainting. Erase any region — a person, a logo, a power line — and have the model fill the hole with plausible background. Three input modes: send just the photo to auto-erase the subject, send a mask PNG, or send a bounding box.",
    params: [
      COMMON_FILE_PARAM,
      {
        field: "mask",
        type: "file",
        desc: "Optional mask PNG/JPEG — white pixels = inpaint, black = keep. If omitted and no bbox, BiRefNet auto-detects the subject and inverts the mask.",
      },
      {
        field: "x,y,w,h",
        type: "int",
        desc: "Optional bounding box in image pixels. Synthesized into a mask internally. Ignored if mask is provided.",
      },
      {
        field: "dilation",
        type: "int 0-32",
        def: "8",
        desc: "Expand the mask by N pixels before inpainting. Helps blend edges.",
      },
      {
        field: "format",
        type: "string",
        def: "png",
        desc: "Output format — png, webp, or jpg.",
      },
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 380
x-knockout-model: big-lama
x-knockout-mode: auto-subject`,
    responseBody: "<binary inpainted image, same dimensions as input>",
    errors: [
      { status: "400", code: "empty_mask", desc: "Mask has no pixels to inpaint." },
      { status: "400", code: "invalid_bbox", desc: "bbox extends outside the image." },
      { status: "400", code: "invalid_dilation", desc: "dilation must be 0..32." },
      { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
      { status: "413", code: "payload_too_large", desc: "Image exceeds 10 MB or 4096×4096." },
      { status: "422", code: "no_subject_detected", desc: "No subject detected. Send mask or bbox instead." },
      { status: "429", code: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
      { status: "500", code: "inpaint_failed", desc: "Inpaint failed or produced no output." },
    ],
    notes: [
      "Mode precedence when multiple fields present: mask > bbox > auto-subject.",
      "Auto-subject mode uses BiRefNet to detect the foreground, then inverts the mask so the background is filled. Great for removing people from backgrounds.",
      "LaMa (Large Mask Inpainting) — Apache-2.0 licensed. Deterministic, no prompts, no diffusion sampling.",
      "Runs at 1024px internally, then composites back to original resolution — unmasked pixels are byte-identical to input.",
      "Chain with /upscale if you need sharper fills on very large images.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/inpaint" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@photo.jpg" \\
  -F "dilation=8" \\
  -o inpainted.png`,
    prev: { slug: "silhouette", label: "POST /silhouette" },
    next: { slug: "shadow", label: "POST /shadow" },
  },

  // ============== COMPOSITION ==============
  {
    slug: "shadow",
    verb: "POST",
    path: "/shadow",
    group: "Composition",
    title: "Drop shadow composite",
    lede:
      "Cut out the subject and composite it back onto a transparent (or colored) background with a drop shadow — adjustable angle, blur, opacity, and color.",
    params: [
      COMMON_FILE_PARAM,
      { field: "angle", type: "int 0-360", def: "135", desc: "Shadow angle in degrees. 0 = right, 90 = down." },
      { field: "blur", type: "int 0-100", def: "20", desc: "Gaussian blur radius in pixels." },
      { field: "opacity", type: "float 0-1", def: "0.4", desc: "Shadow alpha." },
      { field: "color", type: "string", def: "#000000", desc: "Shadow hex color." },
      { field: "offset", type: "int", def: "12", desc: "Pixel distance shadow is offset from subject." },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary PNG, subject + drop shadow + transparent canvas>",
    errors: COMMON_ERRORS,
    curl: curlFor("/shadow", `-F "blur=24" -F "opacity=0.35"`),
    prev: { slug: "inpaint", label: "POST /inpaint" },
    next: { slug: "studio-shot", label: "POST /studio-shot" },
  },
  {
    slug: "studio-shot",
    verb: "POST",
    path: "/studio-shot",
    group: "Composition",
    title: "E-commerce studio shot",
    lede:
      "One-call e-commerce preset: cutout, padding, soft drop shadow, neutral background. Tuned for catalog images and Shopify-style product tiles.",
    params: [
      COMMON_FILE_PARAM,
      { field: "bg_color", type: "string", def: "#FFFFFF", desc: "Background hex color." },
      { field: "padding", type: "int", def: "10%", desc: "Padding as pixels or % of canvas." },
      { field: "shadow", type: "boolean", def: "true", desc: "Whether to add a soft drop shadow." },
      {
        field: "transparent",
        type: "boolean",
        def: "false",
        desc: "Keep a transparent background. Ignores bg_color and shadow (a shadow needs an opaque bg). Output is forced to PNG if format=jpg, since jpg can't carry alpha.",
      },
      { field: "aspect", type: "string", def: "1:1", desc: "Output aspect ratio." },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary opaque PNG/JPG, e-commerce-ready>",
    errors: COMMON_ERRORS,
    notes: [
      "Defaults match Shopify and Amazon catalog requirements: 1:1, white bg, 10% padding.",
      "Override aspect to 4:5 for Instagram, 16:9 for desktop catalog headers.",
      "When transparent=true, bg_color and shadow are ignored.",
      "Output is PNG (alpha). Requesting jpg auto-coerces to PNG.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/studio-shot" \\
  -H "Authorization: Bearer $KNOCKOUT_TOKEN" \\
  -F "file=@product.jpg" \\
  -F "transparent=true" \\
  --output studio.png`,
    node: `const png = await client.studioShot({ file: "./product.jpg", transparent: true });`,
    python: `png = client.studio_shot("product.jpg", transparent=True)`,
    prev: { slug: "shadow", label: "POST /shadow" },
    next: { slug: "headshot", label: "POST /headshot" },
  },
  {
    slug: "headshot",
    verb: "POST",
    path: "/headshot",
    group: "Composition",
    title: "Portrait headshot cleanup",
    lede:
      "Portrait-tuned cutout + light face restoration + neutral background. For profile photos, team pages, and avatar uploads.",
    params: [
      COMMON_FILE_PARAM,
      { field: "bg_color", type: "string", def: "#F4F4F5", desc: "Background hex color." },
      { field: "restore_face", type: "boolean", def: "true", desc: "Run GFPGAN over the face region." },
      { field: "aspect", type: "string", def: "1:1", desc: "Output aspect ratio." },
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary opaque image, portrait>",
    errors: COMMON_ERRORS,
    notes: [
      "Combines /remove + /face-restore + /smart-crop in a single GPU pass — faster than chaining them.",
      "Falls back to /studio-shot if no face is detected (request still succeeds).",
    ],
    curl: curlFor("/headshot"),
    prev: { slug: "studio-shot", label: "POST /studio-shot" },
    next: { slug: "compare", label: "POST /compare" },
  },
  {
    slug: "compare",
    verb: "POST",
    path: "/compare",
    group: "Composition",
    title: "Before/after composite",
    lede:
      "Side-by-side or split-slider before/after preview. Drop into marketing pages, demo widgets, or quality QA tooling.",
    params: [
      COMMON_FILE_PARAM,
      {
        field: "layout",
        type: "string",
        def: "side-by-side",
        desc: "Layout. side-by-side, slider, top-bottom.",
      },
      { field: "label_a", type: "string", def: "Original", desc: "Label for the original image." },
      { field: "label_b", type: "string", def: "Cutout", desc: "Label for the processed image." },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: COMMON_HEADERS,
    responseBody: "<binary opaque image with both versions>",
    errors: COMMON_ERRORS,
    curl: curlFor("/compare", `-F "layout=slider"`),
    prev: { slug: "headshot", label: "POST /headshot" },
    next: { slug: "upscale", label: "POST /upscale" },
  },

  // ============== ENHANCEMENT ==============
  {
    slug: "upscale",
    verb: "POST",
    path: "/upscale",
    group: "Enhancement",
    title: "Upscale 2× / 4×",
    lede:
      "Increase resolution without losing detail. Defaults to Swin2SR (best for photos). Pass model=realesrgan for illustration/anime workloads.",
    params: [
      COMMON_FILE_PARAM,
      { field: "scale", type: "int 2|4", def: "2", desc: "Output is scale× the input dimensions." },
      { field: "model", type: "string", def: "swin2sr", desc: "Upscaler model. swin2sr or realesrgan." },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 412
x-knockout-model: Swin2SR`,
    responseBody: "<binary upscaled image, scale× original dimensions>",
    errors: [...COMMON_ERRORS, { status: "413", code: "output_too_large", desc: "Scaled output exceeds 8192×8192." }],
    notes: [
      "Swin2SR — best on natural photos, slower (~400ms for 1024×1024 at 2×).",
      "Real-ESRGAN — best on illustration / line art / anime, faster (~250ms).",
      "4× costs ~2.5× the latency of 2×. Watch your wall clock.",
    ],
    curl: curlFor("/upscale", `-F "scale=4" -F "model=swin2sr"`),
    prev: { slug: "compare", label: "POST /compare" },
    next: { slug: "face-restore", label: "POST /face-restore" },
  },
  {
    slug: "face-restore",
    verb: "POST",
    path: "/face-restore",
    group: "Enhancement",
    title: "Face restoration",
    lede:
      "GFPGAN-based face restoration. Sharpens blurry faces, recovers detail in compressed images. Optional whole-image upscale.",
    params: [
      COMMON_FILE_PARAM,
      { field: "upscale_bg", type: "boolean", def: "false", desc: "Also upscale the non-face background via Real-ESRGAN." },
      { field: "scale", type: "int 1|2|4", def: "1", desc: "Background upscale factor when upscale_bg is true." },
      COMMON_FORMAT_PARAM,
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 358
x-knockout-model: GFPGAN-1.4`,
    responseBody: "<binary restored image>",
    errors: [
      ...COMMON_ERRORS,
      { status: "422", code: "no_face_detected", desc: "No face found in the image. Try /upscale instead." },
    ],
    notes: [
      "Detects up to 5 faces and restores each. Backgrounds are untouched unless upscale_bg=true.",
      "For a one-call portrait pipeline, /headshot bundles cutout + restore + crop.",
    ],
    curl: curlFor("/face-restore"),
    prev: { slug: "upscale", label: "POST /upscale" },
    next: { slug: "colorize", label: "POST /colorize" },
  },
  {
    slug: "colorize",
    verb: "POST",
    path: "/colorize",
    group: "Enhancement",
    title: "Colorize B&W photos",
    lede:
      "DDColor colorization. Adds plausible color to black-and-white or grayscale photos. ConvNeXt-Large backbone predicting ab channels in LAB color space — single feed-forward inference, no diffusion sampling. Color inputs are accepted too (treated as grayscale internally).",
    params: [
      {
        field: "file",
        type: "file",
        desc: "Source image (B&W, grayscale, or color). JPEG, PNG, WebP. Up to 25 MB.",
        required: true,
      },
      {
        field: "format",
        type: "string",
        def: "png",
        desc: "Output format — png, webp, or jpg.",
      },
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 502
x-knockout-model: DDColor`,
    responseBody: "<binary colorized image, same dimensions as input>",
    errors: [
      { status: "400", code: "invalid_image", desc: "Invalid image, unsupported format, or decode failure." },
      { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
      { status: "403", code: "forbidden", desc: "Invalid bearer token." },
      { status: "413", code: "payload_too_large", desc: "Image exceeds 25 MB." },
      { status: "429", code: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
      { status: "500", code: "colorize_failed", desc: "colorize failed or produced no output." },
    ],
    notes: [
      "Apache-2.0 licensed model (DDColor with ConvNeXt-Large backbone).",
      "~500ms warm on an L4 GPU, ~25s cold start (weights ~870 MB, pre-baked into the image).",
      "Use cases: family archives, historical photos, B&W scans, vintage stock imagery.",
      "Color inputs are accepted — the image is converted to grayscale internally before colorization.",
    ],
    curl: `curl -X POST "https://useknockout--api.modal.run/colorize" \\
  -H "Authorization: Bearer $TOKEN" \\
  -F "file=@old-photo.jpg" \\
  -F "format=png" \\
  -o colorized.png`,
    prev: { slug: "face-restore", label: "POST /face-restore" },
    next: { slug: "preview", label: "POST /preview" },
  },

  // ============== UTILITY ==============
  {
    slug: "preview",
    verb: "POST",
    path: "/preview",
    group: "Utility",
    title: "Low-res quick preview",
    lede:
      "Fast preview that downsamples the input to 256px before processing. Costs nothing against your quota — useful for hover previews and thumbnail grids.",
    params: [COMMON_FILE_PARAM, COMMON_FORMAT_PARAM],
    responseHeaders: `HTTP/1.1 200 OK
content-type: image/png
x-knockout-latency: 64
x-knockout-preview: 1`,
    responseBody: "<binary 256px preview PNG with alpha>",
    errors: [
      { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
      { status: "429", code: "rate_limit_exceeded", desc: "Slow down. Retry-After header tells you when." },
    ],
    notes: [
      "Free tier: previews don't count toward your 20/mo quota.",
      "Paid tier: previews are billed at $0.0005/image (10× cheaper than full /remove).",
      "Always use /preview for hover/thumbnail UX. Reserve /remove for the final export.",
    ],
    curl: curlFor("/preview"),
    prev: { slug: "colorize", label: "POST /colorize" },
    next: { slug: "estimate", label: "POST /estimate" },
  },
  {
    slug: "estimate",
    verb: "POST",
    path: "/estimate",
    group: "Utility",
    title: "Cost estimator",
    lede:
      "Returns the credit/dollar cost a request would incur — without spending GPU time. Use to surface a price preview to your end users.",
    params: [
      {
        field: "endpoint",
        type: "string",
        desc: "Path of the endpoint you'd call (e.g. /remove, /upscale).",
        required: true,
      },
      { field: "scale", type: "int", desc: "For /upscale, the requested scale factor." },
      { field: "stroke_width", type: "int", desc: "For /sticker, the requested stroke width." },
    ],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json
x-knockout-latency: 4`,
    responseBody: `{
  "endpoint": "/upscale",
  "estimated_cost_usd": 0.005,
  "estimated_latency_ms": 412,
  "request_id": "req_01HK..."
}`,
    errors: [{ status: "400", code: "invalid_endpoint", desc: "Endpoint not recognized." }],
    notes: ["No GPU spend. Returns instantly."],
    curl: `curl -X POST "https://useknockout--api.modal.run/estimate" \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint":"/upscale","scale":4}'`,
    prev: { slug: "preview", label: "POST /preview" },
    next: { slug: "health", label: "GET /health" },
  },
  {
    slug: "health",
    verb: "GET",
    path: "/health",
    group: "Utility",
    title: "Health check",
    lede:
      "Returns 200 OK when the service is healthy. No auth required. Use for uptime probes and load balancer checks.",
    params: [],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json`,
    responseBody: `{
  "status": "ok",
  "version": "1.4.2",
  "model": "BiRefNet",
  "gpu": "L4",
  "uptime_s": 18420
}`,
    errors: [{ status: "503", code: "service_unavailable", desc: "Model load failed or GPU is degraded." }],
    notes: [
      "No authentication required. No quota or rate-limit cost.",
      "Use for Pingdom / Statuspage / Better Stack uptime monitors.",
    ],
    curl: `curl https://useknockout--api.modal.run/health`,
    prev: { slug: "estimate", label: "POST /estimate" },
    next: { slug: "stats", label: "GET /stats" },
  },
  {
    slug: "stats",
    verb: "GET",
    path: "/stats",
    group: "Utility",
    title: "Usage stats",
    lede:
      "Per-token usage rollup for the current billing period. Calls, success rate, average latency, total spend estimate.",
    params: [],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json`,
    responseBody: `{
  "period": "2026-05",
  "calls": 1247,
  "success_rate": 0.992,
  "avg_latency_ms": 187,
  "spend_usd": 6.24,
  "by_endpoint": {
    "/remove": 894,
    "/sticker": 211,
    "/replace-bg": 142
  }
}`,
    errors: [
      { status: "401", code: "unauthorized", desc: "Missing or invalid token." },
    ],
    notes: ["Stats are eventually consistent — recent calls (last ~30 seconds) may not appear yet."],
    curl: `curl https://useknockout--api.modal.run/stats \\
  -H "Authorization: Bearer $TOKEN"`,
    prev: { slug: "health", label: "GET /health" },
    next: { slug: "root", label: "GET /" },
  },
  {
    slug: "root",
    verb: "GET",
    path: "/",
    group: "Utility",
    title: "API root",
    lede:
      "Returns API metadata — version, available endpoints, and links to the docs. Useful for sanity-checking SDK installs and proxy setups.",
    params: [],
    responseHeaders: `HTTP/1.1 200 OK
content-type: application/json`,
    responseBody: `{
  "name": "useknockout",
  "version": "1.4.2",
  "docs": "https://useknockout.com/docs",
  "endpoints": [
    "/remove", "/remove-url", "/replace-bg",
    "/remove-batch", "/remove-batch-url",
    "/mask", "/sticker", "/outline", "/smart-crop", "/silhouette", "/inpaint",
    "/shadow", "/studio-shot", "/headshot", "/compare",
    "/upscale", "/face-restore", "/colorize",
    "/preview", "/estimate", "/health", "/stats"
  ]
}`,
    errors: [],
    notes: [],
    curl: `curl https://useknockout--api.modal.run/`,
    prev: { slug: "stats", label: "GET /stats" },
  },
];

export const ENDPOINTS_BY_SLUG: Record<string, EndpointSpec> = Object.fromEntries(
  ENDPOINTS.map((e) => [e.slug, e]),
);
