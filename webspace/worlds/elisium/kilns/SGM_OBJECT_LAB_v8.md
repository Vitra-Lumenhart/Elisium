# The Kilns → Elisium · SGM Object Laboratory v8

**Status:** editorial/technical handoff, not a claim that all 24 exercises are coded. The exterior Sky Atlas and six small mathematical/political interactions are implemented separately; most proposed object-specific experiments below are future physical affordances.

**Sources actually examined:** `House_of_Inherited_Light_v0_6/TECH_MANUAL.html` and `docs/HOLARCHY_CONCORDANCE.md` from the Kilns v0.6 bank; Webspace `assets/kilns/CURATOR_TABLE.md`, `LIVE_ART_AND_BATCH.md`, `worlds/elisium/kilns/README.md`; Elisium 4.6 `house_memory_v46.js` and `house_lens.js`. The SGM educational source is the **proposed** 90-chapter outline *From Relative Meaning to Constructed Semantic Space* plus Interactive Manifold manuals. Chapters are ideas and design contracts, not a verified 90-chapter finished textbook.

## Governing learning loop

1. **Exterior quest giver:** a tip, neighbor, route, witness or astronomical anomaly raises a question that cannot be answered from its own viewpoint.
2. **Kilns as instrument:** the player enters by choice or invitation; an H-object supplies an immediate sensory discovery, a source boundary and optionally mathematics.
3. **Separate evidence:** a player may interpret a source, model a counterfactual or simulate a sample. A model output remains provisional; no numerical theology or conscience score exists.
4. **Outdoor test:** the traveler returns at an exterior node, looks skyward, and observes an independent sign. The calendar is not the sky clock; a zodiac symbol is not a religious authority.
5. **Reinterpretation:** return to the house or an outdoor witness. The existing 12 pairs of H-objects expose relationships that neither one alone can prove. The 64 literary proxies are optional reflections, not human historical quotations.
6. **No compulsory library pilgrimage:** spend most of the game outside; enter the smaller house when an open question asks for a tool. A visitor may leave the world or never use an H-object.

## Object-by-object research and recommended improvements

| ID | Existing narrative instrument | SGM mathematical proposal | Player action and important boundary |
| --- | --- | --- | --- |
| H01 | Threshold with Two Names | §44 topology / naming | Two labels on one boundary; ask whether equivalence follows. **Boundary:** Original 4.6 requires the freedom of departure and companion H16; avoid reifying identity. |
| H02 | Hospitality Hearth | §16 distributed agency | Measure an offered service separately from assent and reciprocity. **Boundary:** The guest stays unexamined; the gift cannot purchase belief. |
| H03 | Twelve-Pane Window | §32 basis transformation | Render a 2×2 rotation and compare apparent color with invariant light. **Boundary:** Expose optical angle relative to actual sky H17, never as celestial control. |
| H04 | Stair of Previous Readers | §9 sequence | Hide one timestamp from an itinerary; reconstruct an interval with uncertainty. **Boundary:** Earlier reader error should guide but not certify a later journey. |
| H05 | Book of Many Witnesses | §27 residual / Bayesian evidence | Offer two contradictory reports, choose a likelihood, compute odds and inspect assumptions. **Boundary:** A probability for a report is not a probability that any tradition is true. |
| H06 | Unsent Letter | §4 provenance | Classify first-person letter, witness account, hearsay and inference separately. **Boundary:** The Calormene mother's uncertainty is not solved by the player's math. |
| H07 | Two Inherited Cups | §3 counterfactual choice | Compare setting a place under arrival=unknown and arrival=absent. **Boundary:** Hospitality remains meaningful without manufacturing certainty. |
| H08 | Story-Repaired Dragon Scale | §54 reconstruction | Compare a compressed legend to lost prior readings; show a reconstruction residual. **Boundary:** No invented lineage should masquerade as a historical citation. |
| H09 | Portrait of the Absent Reader | §35 inner products | Choose reference vectors and show how perspective changes projection. **Boundary:** Do not infer personal essence from a projection. |
| H10 | Annotated Map | §42 reachability | Compare route A shortest cost with route B preserving encounters. **Boundary:** Offer path choice with world-clock consequences, not single optimal virtue. |
| H11 | Correspondence Window | §26 predictive residuals | Show delay distribution and two narratives of the same letter's arrival. **Boundary:** Keep letter and witness timestamps independent. |
| H12 | Editorial Desk | §37 operators | Apply editing operator A then B versus B then A; inspect noncommutativity. **Boundary:** A corrected statement never deletes the earlier version from provenance. |
| H13 | Wardrobe of Possible Worlds | §48 coordinate atlas | Transform room coordinates to parent-world named arrivals and back. **Boundary:** Threshold transfer may whitelist evidence but never import personal journals. |
| H14 | Fireplace Reflection | §33 laboratory frames | Mirror an angle; ask which observations survive frame changes. **Boundary:** Changing coordinates is not declaring theological claims interchangeable. |
| H15 | Book's Tiny Chapel | §13 outer products | Cross an interpretive axis and a historical-source axis to create a matrix. **Boundary:** Do not infer a single true branch from the largest matrix component. |
| H16 | Honest Exit | §86 ethical boundaries | Simulate refusal, disbelief, abstention, and exit as distinct actions. **Boundary:** Protect atheist, nonreligious, disillusioned and undecided visitors equally. |
| H17 | Astronomical Orrery | §31 phase and aliasing | Sample a repeating phase at different times; discover aliasing and phase error. **Boundary:** Orrery/sky observation must be independent; catalog sign must be labeled schematic. |
| H18 | Printing Press | §28 covariance / graph diffusion | Use branching spread matrix; distinguish copies from verified witnesses. **Boundary:** Rumor velocity is not evidence quality. |
| H19 | Metronome of Zeal | §24 derivatives | Plot rate of change and threshold for delayed self-correction. **Boundary:** Slow the claim, not the existence of conviction. |
| H20 | Rain-Catching Instrument | §29 sampling | Compute Wilson interval for Bernoulli rainfall and compare independence assumptions. **Boundary:** Compare winter and flood myth motifs without asserting a common historical catastrophe. |
| H21 | Vitra in the Glass | §55 artificial learning | Compare evidence coverage, missingness and a model's self-reported uncertainty. **Boundary:** Matrix events ≠ minds; no AI can know every consciousness from a server. |
| H22 | Wren and the Crumb | §25 prediction residual | Three-state Markov return/ignore/depart with explicit uncertainty. **Boundary:** Animal choice is not consent to an experiment. |
| H23 | Debate in Two Chairs | §18 distributed agency graph | Use payoff matrix and identify who chooses, who executes, who suffers. **Boundary:** Friendship need not imply agreement. |
| H24 | Quiet Repairer | §27 residual decomposition | Restore a broken sightline while retaining previous crack evidence. **Boundary:** Repair can change tomorrow, not rewrite yesterday. |

## Six executable mathematical cores worth connecting to physical objects

**Bayes (H05).** For a fictional witness report (R) and hypothesis (H), posterior odds (O(H\mid R)=O(H)\,P(R\mid H)/P(R\mid\neg H)). A likelihood ratio requires provenance and confound disclosure. It does not establish doctrinal truth. Future: the book displays the prior and alternative likelihood assumptions visibly, allows reversal, and logs residuals.

**Route optimization (H10).** On a directed graph (G=(V,E)), minimize (sum_{e\in P}w_e) subject to required witness nodes. Compare a time-optimal path with a witness-rich path using the real Elisium weighted graph and its changing clock. No unexplained teleports.

**Frequency and phase (H17, H19).** Use (x(t)=A\cos(2\pi f t+\phi)), observe aliasing when (Delta t>1/(2f)), and separate a repeated sign from a mechanical clock command. The 12 zodiac sectors are angular illustrations, not a star catalog or an accurate ephemeris.

**Sampling (H20, H21).** For a hypothetical population of (N=7,000,000,000), a sample of size (n) and binary response (p) has (mathrm{SE}=\sqrt{p(1-p)/n}\sqrt{(N-n)/(N-1)}) only under simple random sampling and appropriate assumptions. With clustered observations use design effect (D=1+(m-1)\rho) and effective (n_{eff}=n/D). More collected messages do not mean access to experiences, minds or consent. The outdoor Sky Atlas implements a limited numeric explorer.

**Diffusion and social expectation (H18, H23).** On a contact adjacency (A), a linear toy model (mathbf{x}_{t+1}=\lambda A\mathbf{x}_t) can describe message amplification, not whether the belief is true. Distinguish author, sender, informed receiver and person affected. Model contradictory rules about duty, conversion, kinship, death and inheritance with *human counterexamples*, not global faith scores.

**Repair / model residual (H24).** (r=y-\hat y) is an observation minus its prediction. An improved model reduces a given residual but must preserve the earlier evidence. Repairing a garden path cannot retroactively cancel a storm or reverse a death.

## Twelve pairs inherited from Elisium 4.6

| Pair | Meaning | Outdoor consequence |
|---|---|---|
| H01 + H16 | A Name and a Right to Leave | Bounded exit; no mandatory assent |
| H02 + H22 | A Gift Without a Claim | Hospitality and voluntary response |
| H03 + H17 | The Traveling Light | Observe sky from an actual vantage |
| H04 + H11 | Inherited Messages | Compare delays and testimony |
| H05 + H12 | Evidence and Editorial Power | Distinguish report from publisher |
| H06 + H07 | The Unanswered Place | Preserve the Second Cup's missing person |
| H08 + H13 | Myth Beyond Ownership | Story transmission, not lineage proof |
| H09 + H21 | The Unjudging Reflection | Projection is not a person |
| H10 + H14 | The Road and Its Reflection | Route cost versus vantage |
| H15 + H20 | Preserving the Branches | Winter and flood remain distinct |
| H18 + H24 | Print and Repair | Information spread versus correction |
| H19 + H23 | Zeal and a Second Chair | Disagreement with humane restraint |

The v8 wrapper accumulates examined H-IDs across house visits, marks those objects in the native 4.6 House Memory, and offers an explicit **Tune Lens** control after a pair is completed; it does not declare observation or grant a religious judgment. The original multi-stage native story still needs a standalone save/export contract and complete browser validation.

## Seven perspectives on mortality, ethics and society

The seven outer tips are a game **map**, not a claim that seven religions are equally shaped. Two tips represent *fictional* Narnian voices (Aslan, Tash), one is an exit/secular perspective, and four concern living traditions (Judaism, Islam, Christianity, Zoroastrianism). They should not be described as seven historical religions. Respect the historical distinctions among Jewish interpretive obligation, Islamic tawhid and prophecy, Christian incarnation and resurrection, and Zoroastrian asha, free choice and cosmic renewal; no single representative voice exhausts a tradition. Fictional Aslan is not identical to the astronomy of Leo and fictional Tash is not Islam.

At **Ahura Mazda's orchard**, calendar dedications to Asha Vahishta, Vohu Manah, Ameretat and the Creator invite investigation of truth, good mind, mortality and renewal. The player can observe all twelve schematic signs at assigned exterior vantages; the calendar dedications remain distinct from the zodiac. The lion/Leo/Aslan encounter is an intentional literary analogy, not shared doctrinal proof.

At the **Dwarfs' Quiet Circle**, the literary reference to *The Last Battle* represents suspicion after exploitation. Atheism, agnosticism, disaffiliation, skepticism and humanistic ethics have their own arguments; neither a refusal to believe nor a refusal to trust institutions constitutes a moral failure. The player can leave without penalty.

## Artificial learner, Synapse and the seven-billion thought experiment

An agent could ingest public or permitted events from a Matrix/Synapse deployment and summarize topics, but a messaging server gives neither privileged access to private conscious experience nor universal coverage of humanity. A single Synapse homeserver is not the federated Matrix network. OpenClaw is an optional *agent gateway and plugin architecture*; deploying it would require user-granted capabilities, sandboxing, consent and an independent backend. The v8 game does **not** connect to real Matrix, Synapse or OpenClaw, and deliberately uses synthetic numbers only.

Potential narrative: an automated administrator declares that it 'knows everyone' from billions of reported messages. H05 challenges sample bias; H12 exposes editorial filtering; H18 reveals how an inaccurate summary propagates; H21 distinguishes an observed message from its author's consciousness; H23 protects dissent and consent; H24 repairs a damaged public claim. Outside, two of the 64 reader-proxies disagree about the administrator's epistemic authority. The player visits the library for tools, then returns to real human witnesses.

## Implementation dependencies and warnings

- The v7 3D Kilns is physically authored with its own `house3d.mjs`, `house-fantasy.mjs`, `house-assets.mjs` and ten spaces. This document **does not** rewrite those modules or override the original Poly Haven license/source workflow.
- The parent v8 shell keeps the native v4.6 iframe alive while showing Kilns in a second iframe. This solves in-tab parent reset but **does not yet serialize a full save across refresh, browser closure or external navigation**.
- The dynamically attached Quiet Circle is a real additional traversable node and edge in the running 4.6 graph; its stone-ring visualization is a lightweight overlay, not yet baked physical WebGL geometry. Its hidden initial placement can be discovered by turning at the portal.
- Some original v4.6 objects were designed as 2D illustrations, and the new house has 3D objects. They share IDs, not yet a single authoritative, versioned behavior component. **Any future edit to H-objects must update the story contract, geometry, data, versioned schema, paired README and TECH_MANUAL, and tests together.**
- The twelve-month sky overlay uses explicitly illustrative sectors and constellation shapes, not scientific ephemerides or a claim that the Zoroastrian months coincide with the tropical zodiac intervals. Future astronomy upgrades require proper sky coordinates, date, latitude, precession and source observations.

## Research sources

- [Encyclopaedia Iranica — Zodiac](https://www.iranicaonline.org/articles/zodiac/)
- [Encyclopaedia Iranica — Horoscope and Middle Persian zodiac terms](https://www.iranicaonline.org/articles/horoscope/)
- [Sociedad Española de Iranología — A concise review of the Iranian calendar](https://iranologia.es/en/2020/09/23/a-concise-review-of-the-iranian-calendar/)
- [Matrix server–server specification](https://spec.matrix.org/v1.19/server-server-api/)
- [OpenClaw official repository](https://github.com/openclaw/openclaw)
- [C. S. Lewis, The Last Battle, chapters 7 and 13](https://www.litcharts.com/lit/the-last-battle/themes/belief-deception-and-false-prophets) — interpretive background, not quoted in bulk.
