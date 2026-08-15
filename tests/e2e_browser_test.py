import subprocess
import socket
import json
import time
import base64
import os

def send_marionette(sock, msg_id, command, params=None):
    if params is None:
        params = {}
    payload = [0, msg_id, command, params]
    data = json.dumps(payload)
    message = f"{len(data)}:{data}"
    sock.sendall(message.encode('utf-8'))
    
    resp_raw = b""
    while b":" not in resp_raw:
        chunk = sock.recv(1)
        if not chunk:
            break
        resp_raw += chunk
    
    length_str, rest = resp_raw.split(b":", 1)
    msg_length = int(length_str)
    
    content = rest
    while len(content) < msg_length:
        chunk = sock.recv(msg_length - len(content))
        if not chunk:
            break
        content += chunk
        
    res_list = json.loads(content.decode('utf-8'))
    if len(res_list) >= 4:
        error = res_list[2]
        if error:
            raise RuntimeError(f"Marionette Error: {error}")
        return res_list[3]
    return res_list

def run_e2e_test():
    print("🚀 Starting Firefox Headless with Marionette automation...")
    env = os.environ.copy()
    env["DISPLAY"] = ":1"
    env["MOZ_DISABLE_CONTENT_SANDBOX"] = "1"
    env["MOZ_HEADLESS"] = "1"
    
    proc = subprocess.Popen(
        ["/usr/bin/firefox", "--headless", "--marionette"],
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE
    )
    
    sock = None
    for attempt in range(15):
        time.sleep(1)
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(("127.0.0.1", 2828))
            print(f"Connected to Marionette on attempt {attempt + 1}")
            break
        except ConnectionRefusedError:
            sock = None
            
    if not sock:
        proc.kill()
        raise RuntimeError("Failed to connect to Marionette port 2828")
        
    # Handshake
    handshake_len = b""
    while b":" not in handshake_len:
        handshake_len += sock.recv(1)
    length = int(handshake_len[:-1])
    handshake_data = sock.recv(length)
    print("✅ Handshake received:", handshake_data.decode('utf-8')[:60], "...")
    
    try:
        msg_id = 1
        
        # 1. New Session
        print("\n[TEST 1] Creating WebDriver Session...")
        res = send_marionette(sock, msg_id, "WebDriver:NewSession", {})
        msg_id += 1
        session_id = res.get('sessionId') if isinstance(res, dict) else res
        print("Session ID:", session_id)
        
        # 2. Navigate to http://localhost:3000
        print("\n[TEST 2] Navigating to http://localhost:3000...")
        res = send_marionette(sock, msg_id, "WebDriver:Navigate", {"url": "http://localhost:3000"})
        msg_id += 1
        time.sleep(2)
        
        # 3. Check Initial Page Title
        print("\n[TEST 3] Checking Page Title...")
        res = send_marionette(sock, msg_id, "WebDriver:GetTitle", {})
        msg_id += 1
        title_val = res.get('value') if isinstance(res, dict) else res
        print("Page Title:", title_val)
        assert "Поле Чудес" in str(title_val), "Title mismatch!"
        
        # 4. Find Button 'btn-open-museum'
        print("\n[TEST 4] Locating Museum Button (#btn-open-museum)...")
        res = send_marionette(sock, msg_id, "WebDriver:FindElement", {
            "using": "id",
            "value": "btn-open-museum"
        })
        msg_id += 1
        elem_id = res.get('value') if isinstance(res, dict) else res
        raw_id = list(elem_id.values())[0] if isinstance(elem_id, dict) else elem_id
        print("Museum Button ID:", raw_id)
        
        # 5. Click Button
        print("\n[TEST 5] Clicking Button '🏛️ Музей (0/16)'...")
        res = send_marionette(sock, msg_id, "WebDriver:ElementClick", {
            "id": raw_id
        })
        msg_id += 1
        print("Click executed successfully!")
        time.sleep(1)
        
        # 6. Verify Museum Modal is visible
        print("\n[TEST 6] Verifying '#modal-museum' visibility and class...")
        res = send_marionette(sock, msg_id, "WebDriver:FindElement", {
            "using": "id",
            "value": "modal-museum"
        })
        msg_id += 1
        modal_elem = res.get('value') if isinstance(res, dict) else res
        modal_id = list(modal_elem.values())[0] if isinstance(modal_elem, dict) else modal_elem
        
        res = send_marionette(sock, msg_id, "WebDriver:GetElementAttribute", {
            "id": modal_id,
            "name": "class"
        })
        msg_id += 1
        modal_classes = res.get('value', '') if isinstance(res, dict) else str(res)
        print(f"Modal Class: '{modal_classes}'")
        assert "hidden" not in modal_classes, f"FAIL: modal-museum still has hidden class! ({modal_classes})"
        print("✅ SUCCESS: 'hidden' class removed, Modal is OPEN!")
        
        # 7. Count Trophy Cards
        print("\n[TEST 7] Counting rendered Trophy Cards (.trophy-card)...")
        res = send_marionette(sock, msg_id, "WebDriver:FindElements", {
            "using": "css selector",
            "value": ".trophy-card"
        })
        msg_id += 1
        cards = res if isinstance(res, list) else res.get('value', [])
        print(f"Total Trophy Cards rendered in DOM: {len(cards)}")
        assert len(cards) == 16, f"Expected 16 trophy cards, got {len(cards)}"
        print("✅ SUCCESS: All 16 trophy cards are rendered in DOM!")
        
        # 8. Check Locked Status
        res = send_marionette(sock, msg_id, "WebDriver:FindElements", {
            "using": "css selector",
            "value": ".trophy-card.locked"
        })
        msg_id += 1
        locked_cards = res if isinstance(res, list) else res.get('value', [])
        print(f"Total Locked Cards (🔒 ???): {len(locked_cards)}")
        assert len(locked_cards) == 16, f"Expected 16 locked cards, got {len(locked_cards)}"
        print("✅ SUCCESS: All 16 cards show locked state (0 prizes initial state)!")
        
        # 9. Take Screenshot of live opened Museum Modal
        print("\n[TEST 9] Capturing live screenshot of opened Museum Modal...")
        res = send_marionette(sock, msg_id, "WebDriver:TakeScreenshot", {
            "full": False
        })
        msg_id += 1
        img_b64 = res.get('value') if isinstance(res, dict) else res
        if img_b64 and isinstance(img_b64, str):
            with open("/tmp/live_museum_opened.png", "wb") as f:
                f.write(base64.b64decode(img_b64))
            print("✅ SUCCESS: Live screenshot saved to /tmp/live_museum_opened.png!")
            
        # 10. Close Session
        send_marionette(sock, msg_id, "WebDriver:DeleteSession", {})
        print("\n🎉 ALL REAL BROWSER E2E TESTS PASSED (100%)!")
    finally:
        sock.close()
        proc.kill()

if __name__ == "__main__":
    run_e2e_test()
