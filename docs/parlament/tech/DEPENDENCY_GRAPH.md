# Dependency Graph

```text
DocumentChunk → ImpactClaim → ImpactPathEdge → ImpactDomainAssessment
              → BoundaryAssessment / RecommendationReason → RecommendationCandidate
```

Changing a document version records a diff and invalidates only downstream nodes that cite affected chunks.  The base migration stores the version/chunk/diff and claim-link layers; precise invalidation is introduced with structured original-document extraction, not inferred from DIP metadata.

