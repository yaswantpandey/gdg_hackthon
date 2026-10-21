# Demo kit: script, pitch, judge Q&A

## Before you go on stage (10 minutes)

- [ ] Phone: app opened once on Wi-Fi (you saw "अब बिना इंटरनेट के भी चलेगा"), language **हिंदी**, **My list cleared**.
- [ ] Laptop: `npm run server` running with the hosted key; do **one warm-up scan** so the first real one is fast.
- [ ] Print **`docs/demo-strip.png`** (fictional "DEMOSTATIN 10" strip) on paper. This is the thing you photograph.
- [ ] Aeroplane-mode toggle reachable in one swipe.
- [ ] Backup: `docs/screenshots/` open in a tab, and the link `/?q=Demostatin%2010`.

All brands in the demo are **fictional sample data**. Say so once, early; judges respect it.

## (a) 3-minute demo script

| Time | Do | Say |
|---|---|---|
| **0:00–0:20** · Hook | Hold up the printed strip. | "This is Demostatin 10. At the counter it costs ₹240. The same salt, same strength, at a Jan Aushadhi Kendra: ₹28. Nothing on this strip tells you that. Our demo uses fictional brands with sample prices; the pipeline for real government data is built." |
| **0:20–0:50** · Messy typing | Type `democilin500` (typo, no space). Card appears. Then clear and type `डेमोस्टैटिन`. | "Real people type like this: a typo, no space, or in Hindi. It still finds the right medicine and strength. No internet needed for this part." |
| **0:50–1:30** · Photo scan | Tap **स्कैन** → **फ़ोटो लें** → photograph the printed strip. Point at the editable box ("Atorvastatin 10 mg"). Tap **इस नाम से खोजें**. | "Gemma 4 reads only the printed name and strength, that's all it's allowed to do. It never tells you a price. And you see exactly what it read and can correct it." |
| **1:30–1:55** · **The moment** | Let the card land: ₹240 struck out → **₹28**, "बचत ₹212 · 88% सस्ता". **Pause two seconds.** Tap **मेरी पर्ची में जोड़ें**, show the total bar. | "₹240 becomes ₹28. Eighty-eight percent, on one strip. For a family on monthly blood-pressure and diabetes medicines, that adds up every month." |
| **1:55–2:15** · Disclaimer | Point to the line under the search box. | "This line never goes away: price and molecule information only, not medical advice, confirm with your doctor or pharmacist. We never tell anyone to switch. That decision belongs to the doctor and the pharmacist." |
| **2:15–2:40** · Not found | Type `Crocin`. "हमारे डेटा में नहीं मिली". | "If it's not in our data, we say so. We never guess. An app that guesses drug names is dangerous; ours says 'I don't know'." |
| **2:40–3:00** · Offline + close | Swipe on **aeroplane mode**, search `demostatn 10` again: it works. | "Aeroplane mode, and it still works: under 100 KB of code, Hindi-first, built for a cheap phone with bad signal. Open source, MIT. Next: the real PMBJP list, more languages, and a Kendra locator. Thank you." |

**If the scan fails on stage:** don't apologise. Tap **नाम लिखकर खोजें** and say: "That's exactly why typing is always one tap away. The AI is a helper, never a dependency." Then type `demostatn 10` and continue at 1:30.

## (b) Pitch: 5 bullets

1. **Problem fit:** Patients pay for a brand name they can't read or compare. We turn that name, typed badly or photographed, into the generic name, strength and the saving, with "₹240 → ₹28" as the headline and an honest "Not found in our data" when we don't know.
2. **Impact:** Built for the people who overpay most: Hindi-first, one-handed, big targets, works on a cheap Android in aeroplane mode, and prints a bilingual sheet to hand across the counter at a Jan Aushadhi Kendra.
3. **Innovation (safe by design):** Gemma 4 only *reads* the label. It never states a drug fact. Its output is treated as untrusted text: shown to the user, editable, and accepted only if it matches our dataset.
4. **Innovation (offline intelligence):** Fuzzy plus phonetic matching tuned for Indian spellings ("parasetmol" → paracetamol, "डेमोस्टैटिन" → Demostatin) runs entirely on the phone, with zero network requests for typed search.
5. **Scales with data, not code:** New drugs, prices, languages and Kendra lists are JSON files fed through a validated pipeline; the same app runs with hosted Gemma or fully local Gemma on a clinic laptop by changing one setting.

## (c) Likely judge questions

**1. "What if the model is wrong?"**
Then the user sees it before anything happens. Gemma's reading goes into an editable box, not straight to a result. Even if it misreads, the text must match a real entry in our dataset, or we show "Not found in our data". Facts, prices and salt never come from the model. If a match is uncertain (confidence under 0.9), the card shows a red "we're not sure, check the mg on the strip" warning. And the disclaimer always says to confirm with the pharmacist. Handwriting isn't supported; we're upfront that we read printed strips and boxes.

**2. "How accurate is your data?"**
Today it's honest sample data: 10 fictional brands, clearly labelled on screen and on every printout. The real data comes from official sources: the PMBJP product list for Jan Aushadhi prices and NPPA notifications for ceiling prices. Every row carries its source and date, shown to the user. Our validator rejects missing fields, bad prices, duplicates and any row where the generic isn't cheaper. Prices are labelled indicative, compared per pack of the same size, and there's a "report a mistake" link in the app.

**3. "How does it scale?"**
Three ways. **Data:** adding drugs means adding rows through `scripts/clean.js`, with no code change; thousands of products still search instantly on the phone. **Languages:** a new language is one JSON file plus local spellings as aliases. **Users:** typed search is a static site with no server cost per search; only photo scans hit our small, rate-limited proxy, which can run hosted, or as local Gemma on a district or clinic machine.

**4. "Why Gemma?"**
It's open-weight and multimodal, so the same model runs hosted for speed or fully local for privacy: one environment variable switches between them. The small `gemma4:e2b` runs on an ordinary laptop, which matters for health data and for clinics with poor internet. And open weights mean no lock-in for a public-good tool.

**5. "Isn't this giving medical advice? Are generics really the same?"**
We deliberately don't advise. We show the molecule, strength and price from official data, and every screen and printout says "not medical advice, confirm with your doctor or pharmacist". We never say "switch". We give patients the question to ask.

**6. "What about privacy of prescription photos?"**
The phone shrinks the photo and strips location data before upload. The proxy keeps it in memory for one request, never writes it to disk, and never logs it. The prescription list stays on the phone. For real prescriptions, run Gemma locally; with the hosted free tier, Google receives the image, and we document that in SECURITY.md.

**7. "Doesn't something like this already exist?"**
Official tools such as the Janaushadhi Sugam app help people find Kendras and products. We start from the other end: the brand name on *your* strip, typed badly, in Hindi, or photographed, and we work offline and print a sheet for the counter. Our data pipeline is designed to ingest the official list, so we complement it rather than compete.

**8. "Does it really work offline on a cheap phone?"**
Yes, and we test it. After one visit the whole app and dataset are cached, and typed search makes zero network requests. We proved it with the server switched off and the network offline. It's about 94 KB of JavaScript, scores Lighthouse mobile Performance 91–93 and Accessibility 100, and works with large system text and in landscape. Photo scan is the only feature that needs internet, and it falls back to typing.
