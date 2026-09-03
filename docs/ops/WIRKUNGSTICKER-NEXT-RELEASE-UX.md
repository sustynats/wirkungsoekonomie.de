# Wirkungsticker: UX-Ergänzungen für das Titelbild-Release

Auftrag vom 3. September 2026: gemeinsam mit der noch ausstehenden automatischen
Higgsfield-/Wirkungskarten-Pipeline veröffentlichen, ohne das Stabilitäts-Release
(PR #345) erneut zu verzögern.

Vorbereitet, noch nicht live:

- Einmaliger, freiwilliger Push-Hinweis beim ersten sichtbaren Aufruf der
  installierten Web-App. „Benachrichtigungen aktivieren“ löst erst durch Antippen
  die Systemfreigabe aus; „Nicht jetzt“ und Escape schließen den Hinweis dauerhaft
  für dieses Browserprofil. Aktivierung bleibt später in den Einstellungen möglich.
- Keine erneute Nachfrage nach aktivierter, blockierter oder ausdrücklich
  deaktivierter Benachrichtigung. Kein Dialog ohne Web-Push-Unterstützung bzw.
  funktionierende Service-Worker-Registrierung. Kein automatischer Push-Opt-in.
- Verbindungsfehler werden im weiterhin schließbaren Hinweis angezeigt.
- „Passende Fragen zum Begriff“ wird im gesamten Wirkungsticker nicht mehr
  automatisch eingefügt. Begriffsseiten und andere Website-Bereiche bleiben unverändert.

Vor gemeinsamer Veröffentlichung: aktuellen main-Stand übernehmen, Cache-Versionen
für main.js/news-pwa.js/news.css und den Service Worker erhöhen, News-Seiten und
Suchartefakte neu generieren, Tests und Browser-Abnahme durchführen. Insbesondere
iPhone-Home-Screen-App und Android-PWA prüfen. Der Website-Dialog ersetzt nicht die
Systemfreigabe und kann eine dortige Ablehnung nicht aufheben.

Referenzen: [WebKit: Web Push für Home-Screen-Apps](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/),
[MDN: Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API).
