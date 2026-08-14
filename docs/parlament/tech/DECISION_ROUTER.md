# Decision Router

Order of resolution is mandatory:

1. deterministic rule;
2. current leading WÖk knowledge and registry data;
3. approved, scoped `ResolutionPattern`;
4. bounded WÖk-KI microtask;
5. human editorial decision.

The direct-human path applies to normative mapping, non-compensation/boundary assessment, central conflicted evidence, final recommendation, publication, method-rule promotion and fundamental SDG+-questions.  Legal questions are routed to `LEGAL_REVIEW_REQUIRED` and are not treated as legal advice by the portal.

`routerForQuestion()` is deliberately party-blind.  The CI fixture must prove: equal text + evidence + methodology with different party metadata yields the same router and assessment package.

