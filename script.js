function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (username === "admin" && password === "1234") {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
  } else {
    document.getElementById("loginError").innerHTML =
      "Hatalı kullanıcı adı veya şifre";
  }
}

function logout() {
  document.getElementById("mainApp").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
}

async function generateHypothesis() {
  const study = Number(document.getElementById("study").value);
  const absence = Number(document.getElementById("absence").value);
  const score = Number(document.getElementById("score").value);
  const output = document.getElementById("output");

  if (
    document.getElementById("study").value === "" ||
    document.getElementById("absence").value === "" ||
    document.getElementById("score").value === ""
  ) {
    output.innerHTML = "<span class='bad'>Lütfen tüm alanları doldurunuz.</span>";
    return;
  }

  if (study < 0 || absence < 0) {
    output.innerHTML = "<span class='bad'>Çalışma saati ve devamsızlık negatif olamaz.</span>";
    return;
  }

  if (score < 0 || score > 100) {
    output.innerHTML = "<span class='bad'>Sınav puanı 0 ile 100 arasında olmalıdır.</span>";
    return;
  }

  output.innerHTML = "AI sistemi analiz yapıyor...";

  function localResult() {
    let systemScore = score + (study * 5) - (absence * 4);

    if (systemScore > 100) systemScore = 100;
    if (systemScore < 0) systemScore = 0;

    let category = systemScore >= 75 ? "Yüksek Başarı" :
                   systemScore >= 50 ? "Orta Başarı" :
                   "Akademik Risk";

    let confidence = 70;

    if (study >= 6) confidence += 8;
    else if (study >= 3) confidence += 4;
    else confidence += 1;

    if (absence <= 2) confidence += 8;
    else if (absence <= 5) confidence += 4;
    else confidence += 1;

    if (score >= 75) confidence += 9;
    else if (score >= 50) confidence += 5;
    else confidence += 2;

    if (confidence > 95) confidence = 95;

    let hypothesis = "";

    if (systemScore >= 75) {
      hypothesis = "Çalışma süresi ve sınav puanı yüksek, devamsızlık ise kontrol altında olduğunda akademik başarı artabilir.";
    } else if (systemScore >= 50) {
      hypothesis = "Orta düzey çalışma ve sınav performansı, düzenli tekrar ve devamsızlığın azaltılmasıyla daha iyi sonuçlara dönüşebilir.";
    } else {
      hypothesis = "Düşük performans, yetersiz çalışma süresi veya yüksek devamsızlık ile ilişkili olabilir.";
    }

    let recommendation = systemScore >= 75
      ? "Mevcut çalışma düzeni korunmalı ve devamsızlık düşük tutulmalıdır."
      : systemScore >= 50
      ? "Çalışma süresi artırılmalı, eksik konular tekrar edilmeli ve devamsızlık azaltılmalıdır."
      : "Günlük çalışma planı oluşturulmalı, derse katılım artırılmalı ve düşük puanlı konular tekrar edilmelidir.";

    output.innerHTML = `
      <div class="hypothesis">
        <strong>📌 Üretilen Hipotez</strong><br><br>
        ${hypothesis}<br><br>
        <strong>Güven Skoru:</strong> %${confidence}<br>
        <strong>Genel Başarı Skoru:</strong> ${Math.round(systemScore)} / 100<br>
        <strong>Kategori:</strong> ${category}<br><br>
        <strong>💡 AI Önerisi:</strong><br>
        ${recommendation}
      </div>
    `;
  }

  const url =
    "https://beyzakrgz.app.n8n.cloud/webhook-test/e0cbdfcb-cf04-411d-9c9c-2840cd803e66" +
    `?study_hours=${study}&absence_count=${absence}&exam_score=${score}`;

  try {
    const response = await fetch(url, { method: "GET" });
    const data = await response.json();

    console.log("n8n cevabı:", data);

    const item = Array.isArray(data) ? data[0] : data;

    if (!item.system_score || !item.category || !item.recommendation) {
      localResult();
      return;
    }

    output.innerHTML = `
      <div class="hypothesis">
        <strong>📌 Üretilen Hipotez</strong><br><br>
        ${item.hypothesis}<br><br>
        <strong>Güven Skoru:</strong> ${item.confidence}<br>
        <strong>Genel Başarı Skoru:</strong> ${item.system_score} / 100<br>
        <strong>Kategori:</strong> ${item.category}<br><br>
        <strong>💡 AI Önerisi:</strong><br>
        ${item.recommendation}
      </div>
    `;
  } catch (error) {
    console.log("n8n hata:", error);
    localResult();
  }
}