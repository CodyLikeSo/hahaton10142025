from config import SECRET_KEY
import requests


def ask_qwen(question, prompt, key) -> str:

    if not key:
        raise ValueError("API key is required")

    url = "https://llm.t1v.scibox.tech/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    payload = {
        "model": "Qwen2.5-72B-Instruct-AWQ",
        "messages": [
            {"role": "system", "content": prompt},
            {"role": "user", "content": question},
        ],
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 512,
    }

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 429:
        raise RuntimeError("429 Too Many Requests")
    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()


def validate_string(string: str) -> str:
    if not isinstance(string, str):
        raise ValueError("Input must be a string")
    if not string.strip():
        raise ValueError("Input text cannot be empty")
    return string.strip()





def send_telegram_log(
    message: str,
    chat_id: int = -4626728827,
    bot_token: str = '7572307706:AAHDl108ldmfBGr9xm9giDayY8oAuCAx1HE'
):
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML'
    }
    response = requests.post(url, data=data)
    if not response.ok:
        print(f"Ошибка отправки: {response.status_code} — {response.text}")
    else:
        print("Сообщение отправлено успешно.")