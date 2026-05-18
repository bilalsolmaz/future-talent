/**
 * Kullanıcı oturumu için rastgele bir benzersiz kimlik (UUID v4) üretir.
 * Bu ID, chatbot konuşma geçmişini (AgentKonusma) arka planda eşleştirmek için kullanılır.
 */
export function getOrCreateSessionId() {
    const SESSION_KEY = "localshop_chat_session_id";
    let sessionId = localStorage.getItem(SESSION_KEY);
    
    if (!sessionId) {
        // Basit bir UUID v4 implementasyonu (crypto objesi kullanılarak)
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            sessionId = crypto.randomUUID();
        } else {
            // Fallback (eski tarayıcılar için)
            sessionId = 'LS-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        localStorage.setItem(SESSION_KEY, sessionId);
    }
    
    return sessionId;
}
