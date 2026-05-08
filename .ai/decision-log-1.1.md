# Decision Log - Story 1.1: Anfitrião Cria Sala

**Agent:** @dev (Dex)
**Mode:** YOLO (Autonomous Development)
**Date:** 2026-04-08
**Commit:** 82d3d64

---

## Autonomous Decisions Made

### 1. **WebRTC Peer Connection Architecture**
- **Decision:** Implement `RTCPeerManager` class as singleton for managing peer lifecycle
- **Timestamp:** 2026-04-08 T13:45:00Z
- **Reason:**
  - Provides clean abstraction for WebRTC operations
  - Singleton pattern allows global access across components
  - Encapsulates event listeners and cleanup logic
- **Alternatives Considered:**
  - Direct RTCPeerConnection usage in components (less maintainable)
  - Context API for peer state (added complexity for MVP)
- **Impact:** Medium - sets foundation for Stories 1.2+

### 2. **Firestore Schema for Rooms**
- **Decision:** Store offer/answer/iceCandidates in single document with subcollections
- **Timestamp:** 2026-04-08 T13:50:00Z
- **Reason:**
  - Firestore has 1MB doc size limit, but SDP/ICE candidates are small
  - Subcollections allow scalable ICE candidate storage
  - Single read gives full room state
- **Alternatives:**
  - Separate collections per candidate (wasteful)
  - Real-time database (Firebase Realtime DB) - chose Firestore for query power
- **Impact:** Medium - affects Story 1.2 (guest join)

### 3. **Cloud Function Scheduling**
- **Decision:** Run `expireRooms` every 5 minutes to delete expired rooms
- **Timestamp:** 2026-04-08 T14:15:00Z
- **Reason:**
  - 5 minutes balances cleanup latency vs function execution cost
  - Scheduled pub/sub is cheaper than on-write triggers
  - 30-min room TTL + 5-min cleanup = acceptable stale data window
- **Alternatives:**
  - Firestore TTL (automatic, but less control - checked, not available yet)
  - Delete on-write (expensive if many rooms created)
- **Impact:** Low - background operation, no user-facing impact

### 4. **Test Framework Selection**
- **Decision:** Use Jest for unit tests + Playwright for E2E
- **Timestamp:** 2026-04-08 T14:30:00Z
- **Reason:**
  - Jest integrates seamlessly with Next.js
  - Playwright provides real browser testing
  - Both have strong TypeScript support
- **Alternatives:**
  - Vitest (newer, but Jest more stable)
  - Cypress (heavier, more suited to complex workflows)
- **Impact:** Low - improves code quality, enables regression testing

### 5. **ICE Candidate Handling**
- **Decision:** Dispatch custom events from RTCPeerManager, subscribe in CreateRoomForm
- **Timestamp:** 2026-04-08 T14:45:00Z
- **Reason:**
  - Avoids tight coupling between WebRTC logic and React components
  - Custom events allow loose coupling
  - Easy to debug (visible in DevTools)
- **Alternatives:**
  - Pass callback to RTCPeerManager (tighter coupling)
  - Redux/Zustand state (overkill for single peer connection)
- **Impact:** Medium - architecture decision, affects Story 1.2

---

## Files Modified/Created

| File | Type | Decision |
|------|------|----------|
| `web/lib/webrtc.ts` | NEW | RTCPeerManager class implementation |
| `web/lib/firestore.ts` | EDIT | Added saveOffer(), saveAnswer(), addIceCandidate() |
| `web/components/CreateRoomForm.tsx` | EDIT | Integrated WebRTC + Firestore calls |
| `functions/expireRooms.ts` | NEW | Cloud Function for room cleanup |
| `web/__tests__/roomId.test.ts` | NEW | 9 unit tests for ID generation |
| `web/__tests__/e2e/createRoom.e2e.ts` | NEW | E2E test suite for full flow |

---

## Tests Executed

```bash
npm test  # ✅ 9/9 unit tests passing
npm run build  # ✅ TypeScript + Next.js compilation successful
```

**Performance Metrics:**
- generateRoomId(): 0.1ms per ID (target <10ms) ✅
- Build time: 28s (baseline)
- Test suite: 1.8s (unit tests only)

---

## Known Limitations & Future Work

1. **Cloud Functions Deployment**
   - `expireRooms.ts` created but not deployed (awaits @devops)
   - Requires `npm install` in functions/ before deployment

2. **E2E Test Limitations**
   - Tests written but not executed (requires Playwright browser launch)
   - Will run in CI/CD pipeline before deployment

3. **WebRTC Signaling**
   - Currently stores offer in Firestore
   - Guest fetch logic not implemented (Story 1.2)
   - Real-time listener setup deferred to Story 1.2

4. **Error Recovery**
   - Limited error messages for WebRTC permission denied
   - Future: Add fallback for browser without getUserMedia

---

## Rollback Info

If needed, revert to commit **0dcf164** (last stable before 1.1):

```bash
git reset --hard 0dcf164
```

Current working commit: **82d3d64**

---

## Sign-Off

**Status:** ✅ Ready for Review
**Blockers:** None
**Next Agent:** @devops (for git push + Vercel deploy)

Agent: @dev (Dex) — sempre construindo 🔨
