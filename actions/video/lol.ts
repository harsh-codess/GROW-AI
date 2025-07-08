"use server";

import { collectSegmentData } from "next/dist/server/app-render/collect-segment-data";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const myHeaders = new Headers();
// myHeaders.append("accept", "*/*");
// myHeaders.append("accept-language", "en-US,en;q=0.9");
// myHeaders.append("authorization", "SAPISIDHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5 SAPISID1PHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5 SAPISID3PHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5");
// myHeaders.append("content-type", "application/json+protobuf");
// myHeaders.append("origin", "https://aistudio.google.com");
// myHeaders.append("priority", "u=1, i");
// myHeaders.append("referer", "https://aistudio.google.com/");
// myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"");
// myHeaders.append("sec-ch-ua-arch", "\"x86\"");
// myHeaders.append("sec-ch-ua-bitness", "\"64\"");
// myHeaders.append("sec-ch-ua-form-factors", "\"Desktop\"");
// myHeaders.append("sec-ch-ua-full-version", "\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-full-version-list", "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-mobile", "?0");
// myHeaders.append("sec-ch-ua-model", "\"\"");
// myHeaders.append("sec-ch-ua-platform", "\"Linux\"");
// myHeaders.append("sec-ch-ua-platform-version", "\"6.14.3\"");
// myHeaders.append("sec-ch-ua-wow64", "?0");
// myHeaders.append("sec-fetch-dest", "empty");
// myHeaders.append("sec-fetch-mode", "cors");
// myHeaders.append("sec-fetch-site", "same-site");
// myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
// myHeaders.append("x-client-data", "CJG2yQEIorbJAQipncoBCLL8ygEIlaHLAQiSo8sBCIegzQEIuMjNAQi81c4BCO/mzgEIk+fOAQi6584BCM/ozgEIvO3OAQjd7s4B");
// myHeaders.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
// myHeaders.append("x-goog-authuser", "1");
// myHeaders.append("x-goog-ext-519733851-bin", "CAESAUwwATgEQAA=");
// myHeaders.append("x-user-agent", "grpc-web-javascript/0.1");
// myHeaders.append("Cookie", "SOCS=CAISNQgQEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwNTE0LjA2X3AwGgJmaSADGgYIgOu0sgY; SID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsycY4l9UFDIJHOY_QNNxj2VAACgYKARwSARYSFQHGX2Mi65hdDFLWe_lVN8kAKm4QDRoVAUF8yKq2_N54pnMPH8sNYo5oUVwX0076; __Secure-1PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyzCUf0kjJIJVSwB0ZYpZa5gACgYKASMSARYSFQHGX2Mi_oIgIZrhZGX_ITfAQdZGbhoVAUF8yKoD5h2D0m4Qlipei_3oaMVg0076; __Secure-3PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyNYpZs6onqoCe9Yr0PVUgNgACgYKAe4SARYSFQHGX2Midnvu0VwGv4fEfZUkrYsqqxoVAUF8yKqzaUYlzPA_GJiYUeR73TMM0076; HSID=AdUsNXBEEgErocXCS; SSID=AEEA-JaRBcVmcpe4c; APISID=T0srsOCGoaTPKBwK/ARuj4hBtYbdQiHLtl; SAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-1PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-3PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; SEARCH_SAMESITE=CgQI7J0B; AEC=AVcja2dUScCfVXvXbqFbsx9tKmD20laHMM2PmAJrPsxn3_IYxQZVwvyT4SI; NID=523=hKIx2O9IY37G2rWkTWT-QC5PNZgUOsrM_bGZkx-WHb_7dRGGofZltRQbEwYBronQrmFz-LLVVzZeVF4ogrPtm5NLPej5HYXfCaD2hG9FufqKyT3eCFLivUVacL_1BgIaJQt4KcEZV2zRH8luSyqqDz6WI3NZvdBJp6oY6nU0zP6_RwqVB_gZbyjrhfmNNnaPZf48TS-vCy685onM6OnRrx0YNd2ismE7yNfDRK_P0ti7QYq4Nyi8YtXu685SROlj1o1pxBsQzTi4QuFCAJZCZFMCwWzORmRRJ9scFyX-Ct1YAIFqOSMeRJdlk-qyLhag6Pq-uEwZfjy8w1rQmcnv0EPRFsyz02YrZJf2QkZtGe-yHcso6hPMMHDnkKVxLNnPorXqPrjFtvakY8O_1WaZsvjMS5O_A3W2Unfl0qh3ofcQdeVJgjJpoN0ThoI2YnscWSoAtPfDcxvoRH6cYX1xfcAr_SsPZDR89hN5_SvL8oyRVkdPEtzTaFkUcGVzUoPEFxQtndOW3dP3tyQ6pmRx59vsPr6m5wk4E4G105aSqfLqbkoPp41d8Fmy_Z16cXSZAi4PubYYYhz1fldcvHke5suTegw19YIjh6JFg4XMRtTg5Gx68rNkk-8fJJhh56oK-n2b1Tb52GpU9savsbJss8aiBQBWUnfOdQoqsHSlAc7aLUJcjI4FwyiY1dk5BfvPLd2lcdiUdGRuUmhcS9BYLJuF9KjslMZyUZ1mOhFP-knAdqi8vGbO5vgSpVuooGF4yEUdrRa1v-Q_GYOInDLbO8CqFZ1kwZlopWnHMg2l5S-2NW7WFdlekFHinesdfIuNcKij_XubqswWDlOCD9OWqEHWSNsYmyYRDI_c5ht9ZL5vXL81vFTBpQYwMb3NueKCX5smpPrHAkwN_pABBSqfRrxuh2yJ1Qw5d_0GE7XAlPZ4cvSqWYQKsGvaKqElaLT4drNaGwqY8lTJcHTkTzD1IftB-LBfHzrxszf1H5Gi_hwhkvMySoNSIeGP2kdrsDkzFnYh8Zs6LofRWHLvR9kiV7lsxNS3C7GyK3SCTXvN22XDzsE6LHRwpJ04pOr2KoINk4PZagDIvw; __Secure-1PSIDTS=sidts-CjIBjplskDDYLbsqvDgXJQnprLcEeAjQcbn2cwPQOjKNNKTdoTBd1IpW3LqBdCkQZBVxJBAA; __Secure-3PSIDTS=sidts-CjIBjplskDDYLbsqvDgXJQnprLcEeAjQcbn2cwPQOjKNNKTdoTBd1IpW3LqBdCkQZBVxJBAA; SIDCC=AKEyXzUmRwzbI1hzM6XLxG_KuCaTXurhJIeCG0KPfBfi2Rl9vPeygm99h8JTuuu1Tc179rLVQDM; __Secure-1PSIDCC=AKEyXzX0t8JXXWJETp56WKxzHb1wnUnudhOS03r_4AJnSqPqfK0UL7pH41mqhYET-lcBAv0KP9k; __Secure-3PSIDCC=AKEyXzWPUbFvunTV_mOI2LSWDzDoTgmLZFXbDSuRizvaie4sTZHXEzaD7KEUMDmr2GB2Oqc1wybC; SIDCC=AKEyXzUEsD54L5T9JAXZXu9MsFFZAnMS5mvEYYUpyGpahYQFgqV7KxBTGa3xKOGY9HJDu3kYSkg; __Secure-1PSIDCC=AKEyXzUIasqnGV-uIT4Uo_s8gOdXqyk_9lxZPamaVtN4LO6Lfrjle2lBHf-UePO60VP2JEbG0Yo; __Secure-3PSIDCC=AKEyXzUsl25CPF2n7jRCevOsZuoP1oNZj0VzAnxoFIaWbKXieQgy3PuuloqvDJx6DPIcidnNXTEX");

const myHeaders = new Headers();
myHeaders.append("accept", "*/*");
myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
myHeaders.append("authorization", "SAPISIDHASH 1746105998_526430e9292964711f10b359e2b8f0af195b9b9f SAPISID1PHASH 1746105998_526430e9292964711f10b359e2b8f0af195b9b9f SAPISID3PHASH 1746105998_526430e9292964711f10b359e2b8f0af195b9b9f");
myHeaders.append("content-type", "application/json+protobuf");
myHeaders.append("dnt", "1");
myHeaders.append("origin", "https://aistudio.google.com");
myHeaders.append("priority", "u=1, i");
myHeaders.append("referer", "https://aistudio.google.com/");
myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"");
myHeaders.append("sec-ch-ua-arch", "\"x86\"");
myHeaders.append("sec-ch-ua-bitness", "\"64\"");
myHeaders.append("sec-ch-ua-form-factors", "\"Desktop\"");
myHeaders.append("sec-ch-ua-full-version", "\"135.0.7049.52\"");
myHeaders.append("sec-ch-ua-full-version-list", "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"");
myHeaders.append("sec-ch-ua-mobile", "?0");
myHeaders.append("sec-ch-ua-model", "\"\"");
myHeaders.append("sec-ch-ua-platform", "\"Linux\"");
myHeaders.append("sec-ch-ua-platform-version", "\"6.14.3\"");
myHeaders.append("sec-ch-ua-wow64", "?0");
myHeaders.append("sec-fetch-dest", "empty");
myHeaders.append("sec-fetch-mode", "cors");
myHeaders.append("sec-fetch-site", "same-site");
myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
myHeaders.append("x-client-data", "CJG2yQEIorbJAQipncoBCLL8ygEIlaHLAQiSo8sBCIegzQEIuMjNAQi81c4BCO/mzgEIk+fOAQi6584BCM/ozgEIvO3OAQjd7s4B");
myHeaders.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
myHeaders.append("x-goog-authuser", "1");
myHeaders.append("x-goog-ext-519733851-bin", "CAESAUwwATgEQAA=");
myHeaders.append("x-user-agent", "grpc-web-javascript/0.1");
myHeaders.append("Cookie", "SOCS=CAISNQgQEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwNTE0LjA2X3AwGgJmaSADGgYIgOu0sgY; SID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsycY4l9UFDIJHOY_QNNxj2VAACgYKARwSARYSFQHGX2Mi65hdDFLWe_lVN8kAKm4QDRoVAUF8yKq2_N54pnMPH8sNYo5oUVwX0076; __Secure-1PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyzCUf0kjJIJVSwB0ZYpZa5gACgYKASMSARYSFQHGX2Mi_oIgIZrhZGX_ITfAQdZGbhoVAUF8yKoD5h2D0m4Qlipei_3oaMVg0076; __Secure-3PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyNYpZs6onqoCe9Yr0PVUgNgACgYKAe4SARYSFQHGX2Midnvu0VwGv4fEfZUkrYsqqxoVAUF8yKqzaUYlzPA_GJiYUeR73TMM0076; HSID=AdUsNXBEEgErocXCS; SSID=AEEA-JaRBcVmcpe4c; APISID=T0srsOCGoaTPKBwK/ARuj4hBtYbdQiHLtl; SAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-1PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-3PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; SEARCH_SAMESITE=CgQI7J0B; AEC=AVcja2dUScCfVXvXbqFbsx9tKmD20laHMM2PmAJrPsxn3_IYxQZVwvyT4SI; NID=523=hKIx2O9IY37G2rWkTWT-QC5PNZgUOsrM_bGZkx-WHb_7dRGGofZltRQbEwYBronQrmFz-LLVVzZeVF4ogrPtm5NLPej5HYXfCaD2hG9FufqKyT3eCFLivUVacL_1BgIaJQt4KcEZV2zRH8luSyqqDz6WI3NZvdBJp6oY6nU0zP6_RwqVB_gZbyjrhfmNNnaPZf48TS-vCy685onM6OnRrx0YNd2ismE7yNfDRK_P0ti7QYq4Nyi8YtXu685SROlj1o1pxBsQzTi4QuFCAJZCZFMCwWzORmRRJ9scFyX-Ct1YAIFqOSMeRJdlk-qyLhag6Pq-uEwZfjy8w1rQmcnv0EPRFsyz02YrZJf2QkZtGe-yHcso6hPMMHDnkKVxLNnPorXqPrjFtvakY8O_1WaZsvjMS5O_A3W2Unfl0qh3ofcQdeVJgjJpoN0ThoI2YnscWSoAtPfDcxvoRH6cYX1xfcAr_SsPZDR89hN5_SvL8oyRVkdPEtzTaFkUcGVzUoPEFxQtndOW3dP3tyQ6pmRx59vsPr6m5wk4E4G105aSqfLqbkoPp41d8Fmy_Z16cXSZAi4PubYYYhz1fldcvHke5suTegw19YIjh6JFg4XMRtTg5Gx68rNkk-8fJJhh56oK-n2b1Tb52GpU9savsbJss8aiBQBWUnfOdQoqsHSlAc7aLUJcjI4FwyiY1dk5BfvPLd2lcdiUdGRuUmhcS9BYLJuF9KjslMZyUZ1mOhFP-knAdqi8vGbO5vgSpVuooGF4yEUdrRa1v-Q_GYOInDLbO8CqFZ1kwZlopWnHMg2l5S-2NW7WFdlekFHinesdfIuNcKij_XubqswWDlOCD9OWqEHWSNsYmyYRDI_c5ht9ZL5vXL81vFTBpQYwMb3NueKCX5smpPrHAkwN_pABBSqfRrxuh2yJ1Qw5d_0GE7XAlPZ4cvSqWYQKsGvaKqElaLT4drNaGwqY8lTJcHTkTzD1IftB-LBfHzrxszf1H5Gi_hwhkvMySoNSIeGP2kdrsDkzFnYh8Zs6LofRWHLvR9kiV7lsxNS3C7GyK3SCTXvN22XDzsE6LHRwpJ04pOr2KoINk4PZagDIvw; __Secure-1PSIDTS=sidts-CjIBjplskDDYLbsqvDgXJQnprLcEeAjQcbn2cwPQOjKNNKTdoTBd1IpW3LqBdCkQZBVxJBAA; __Secure-3PSIDTS=sidts-CjIBjplskDDYLbsqvDgXJQnprLcEeAjQcbn2cwPQOjKNNKTdoTBd1IpW3LqBdCkQZBVxJBAA; SIDCC=AKEyXzUmRwzbI1hzM6XLxG_KuCaTXurhJIeCG0KPfBfi2Rl9vPeygm99h8JTuuu1Tc179rLVQDM; __Secure-1PSIDCC=AKEyXzX0t8JXXWJETp56WKxzHb1wnUnudhOS03r_4AJnSqPqfK0UL7pH41mqhYET-lcBAv0KP9k; __Secure-3PSIDCC=AKEyXzWPUbFvunTV_mOI2LSWDzDoTgmLZFXbDSuRizvaie4sTZHXEzaD7KEUMDmr2GB2Oqc1wybC; SIDCC=AKEyXzUEsD54L5T9JAXZXu9MsFFZAnMS5mvEYYUpyGpahYQFgqV7KxBTGa3xKOGY9HJDu3kYSkg; __Secure-1PSIDCC=AKEyXzUIasqnGV-uIT4Uo_s8gOdXqyk_9lxZPamaVtN4LO6Lfrjle2lBHf-UePO60VP2JEbG0Yo; __Secure-3PSIDCC=AKEyXzUsl25CPF2n7jRCevOsZuoP1oNZj0VzAnxoFIaWbKXieQgy3PuuloqvDJx6DPIcidnNXTEX");

// const raw = "[\"models/veo-2.0-generate-001\",\"generate video where dog is riding horse\",[1,\"16:9\",[8]],null,null,null,null,\"!q6ilqPDNAAYKOoS0KjpCnaL7ted7Rj47ADQBEArZ1IKuz9Ms_IG_7ppGr3n3q3sAAXIdrHmIkQHGq8Qsp8c0SP59IOdgn0PTGRRhWgqrAgAAALpSAAAACGgBB34AQY7CAE32sCkeaW1YyNYmtaE5E4VleQ_AmgaNMO1QhxaZ6DJr2J81sSJUP8g2Y2rzcKLsdBVWnWgIVJzSNKdCQAH-mQNdT1iXHqWxF1UsKXKZKZrCJz2JuPbVLNtAfhY17xkLTG0-3F7j1dfmVYiXmxnfiIZRce7JpSLMATqnYVAir-C_ErT2XoA_vnLFlQ3yIBeI9RCow-NlEyyssVtQgVDwaTEAuecEWbDNG-IP44RYczEJU4aJ5QlBrWeJNafcwwpeFFZhGpwDr_aMocxu_dnzyXZtszsLq0zhMQ0TN1NpK51cXulTq9Pjb9XdidWjwZ2cKeqC8MJ1XgE3RWxMmeFpYtuMBUCfH9uS8hTLlV0jxBNSFmXMFGpUIG0kICEx4P0k9YJdJQENU3aWYEIq-CokyKnckMRYKMNbcAjKz_NIgSvHaAxxaHS8lSfGpEn2_2g1c0V6YLCjPUk85THCGENCVvNB-RCmVGTAxG25n9eyJkZkRxH2JH0bgKmsxnu7KnViMkypEdjhyJUMXkObggkQ74Xlg8YOb1oUpJS-ooohBhPMOte6uykA7vzUDcqzrPvY1u-4yqEUZDOiJf-e07dealTB0u5Cahn3FbRiTWQGAGBS__WLT-N-03n1rrcObF9JfEQCmGZCQ_QAIwXamIu3l_ebAaAZzlH18DpgqoHB7V18IFn71Bor0egUCu8SGWp1tqVgJSMrpcvpo0ZZlVwo0QuQbk4O9lReMqe9Knn1j-jVRITZC5keU7av03sVYmIp9cgCF3ATb2hqIdiPn3tZG428GJMbAOz-Si-hanw1ecCZcbYl3AwW6g_QjKGvk5OJN_fTCt-2r0m1ADE5RdUNU9t3l8OOOQYtxpZoFPlTQ1vl1s4gKLJUuKYWYLytf1DyAteW8QtkolE2tHcOv_za-RJglPSl8XMQb4M7BuPzyj9xFRSWjcG2T8REEZPlvlUpD9nk_MhrmQKiBR6lQmaI6ka5Z3RQLGxC0v4WOhtnu4qHCGscxN3aOciK8t8PN_q5pl-qyPsRxUmBPsjgvLR4m15zHh7xjAcfq35sFpTEeP6bzfS8XiFStTpII5huAGAoPj6bCsYgIynD2HQ0TwtjIT6ne5PM7RgYzTOGCgW5bvkrOCe3s6UEo9o46doLk8XI7pMP9WcSdOaigavR3HfIDj_Xv1vK7Un5mXuCe4a4A63JYwi1qMx_gnB0fNF0-aEtLSE2z5ZeIxcIVMtxDipA\"]";
const raw = "[\"models/veo-2.0-generate-001\",\"create video in which dog riding donkey in red cloak\",[1,\"16:9\",[8]],null,null,null,null,\"!d3SldCzNAAYKOoS0KjpCAIhXalMLuTs7ADQBEArZ1LI6USN6NY6OxE27xZ3o4yehAuRK0aHQv6cgsbBmbTWgRGQEz90hAZg12sD4hYwsAgAAATpSAAAAC2gBB34AQW7ks_P8zX9imO4Jy8drtY9nIvW9NrQJtoZEpYZ41Ar9o_qukWkW97PCZ_FXyDKaoJG9zhZtoKlnYRgpn9rOYNVpmQM6-_LlfR_dxV5gvuI9neMfBYcu4O2cGqKjPZWKLi7IravRL9zeEA5Rt_1wihwh-o_osYtAasEw4Xj91wHQ2dpastihVcWg74B-9ntPJ8jVA5fnk3-kZjGC9FEotCDNYVwBhZRT78VVNLjfgnWhHTnSH0Y8d8XtY7tlA9HF1mufLB_bBYPWn9YMQHq9XpoOh0BD7cw5OvHSQ89xu9ct5LAhet5cN4QDj5iJ6wAhoLzsV4SduoPY5RSzmolqfQpI_wPF-C-j97FXflT3CCoXSgMLS1A0DuI7vsjV0HyXtg52x_UiybQX0nEiGpzajvVuo-2dTZ1iibFToFfA-YE_Ut8-pFgaQyLSDwaIZ8FM6Lzk7bADZn20H-OjbgVQDs2dx3U9WQgLRQLKgFdTlqp7Ci2q0iQl_qL-z8tNE4LkarK6A06X_FX0WmWPNmBlY7-IACalS15dA7CJeryFxyFBbsh88AXbNxBqg2VBIqyQGQp1SBfSjKdlLDbBbz4VmFGTp_LfwSg3wu_nFE5Q1a5FBzv-MQc6iuhyWaMTTN0ltEiQU6gg-qH54bQsZ3vSTWfi2NXFIY5YsIJfPln2gV5B3qX-Tu8bP_QwKooTvL8cZckkVws4eRHWX1x7ZjjRpNdlS3tVNMn05mHQc6C-YFRIT3vykWZ5xVeCdcFmMbPi07rxOIi2FVjk8AsVR4DE-fmh5NYlv6vBgNZv9utyXO8g3bmDGjqTcyprucXBrX3Mk9nlxY0gLr_OsQklbS3aSYAN-F0C-RNR1XRK1FIKRFeSbeIZeh4YOWVgDAxKHj48tunVvwImsA9D59C3UNRmBmxE6q-zgOakX7sSQfC9f-_jy_53vyjwfgm2yZOqrNeXpQy9H1pIbAj_JM_uo8oUUxSsIW0nzgdlZETxL-IEBqmen-v4BWDP08g0Syn8f9WQk9n1D75TJnqX2ElAHGqOoueqrmlq9UWzd9MCoJQlCIbhJBTFOEMzsX-ZqxN-eY7z11TSMgmMGSYsp-9yCIy6HfKajYbfW9302RXFKzlW24TDsFQSSpGlGcC4BJmAaxNuf6nRkTPdKxo_Oh8M44k8cp66KMTAlCq5s3FOBZBQqg\"]";



const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow" as RequestRedirect
};


export const createTask = async() =>{

   const res = await fetch("https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateVideo", requestOptions)
    const data = await res.text();
    return data;
}


// const myHeaders = new Headers();
// myHeaders.append("accept", "*/*");
// myHeaders.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
// myHeaders.append("authorization", "SAPISIDHASH 1746035215_e93b25d4bad3c9cbf44ec3434d8c9e4d092ea93a SAPISID1PHASH 1746035215_e93b25d4bad3c9cbf44ec3434d8c9e4d092ea93a SAPISID3PHASH 1746035215_e93b25d4bad3c9cbf44ec3434d8c9e4d092ea93a");
// myHeaders.append("content-type", "application/json+protobuf");
// myHeaders.append("dnt", "1");
// myHeaders.append("origin", "https://aistudio.google.com");
// myHeaders.append("priority", "u=1, i");
// myHeaders.append("referer", "https://aistudio.google.com/");
// myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"");
// myHeaders.append("sec-ch-ua-arch", "\"x86\"");
// myHeaders.append("sec-ch-ua-bitness", "\"64\"");
// myHeaders.append("sec-ch-ua-form-factors", "\"Desktop\"");
// myHeaders.append("sec-ch-ua-full-version", "\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-full-version-list", "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-mobile", "?0");
// myHeaders.append("sec-ch-ua-model", "\"\"");
// myHeaders.append("sec-ch-ua-platform", "\"Linux\"");
// myHeaders.append("sec-ch-ua-platform-version", "\"6.14.3\"");
// myHeaders.append("sec-ch-ua-wow64", "?0");
// myHeaders.append("sec-fetch-dest", "empty");
// myHeaders.append("sec-fetch-mode", "cors");
// myHeaders.append("sec-fetch-site", "same-site");
// myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
// myHeaders.append("x-client-data", "CJG2yQEIorbJAQipncoBCLL8ygEIlKHLAQiSo8sBCIegzQEIuMjNAQi81c4BCJPnzgEIuufOAQjP6M4BCLztzgE=");
// myHeaders.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
// myHeaders.append("x-goog-authuser", "0");
// myHeaders.append("x-goog-ext-519733851-bin", "CAESAUwwATgEQAA=");
// myHeaders.append("x-user-agent", "grpc-web-javascript/0.1");
// myHeaders.append("Cookie", "SOCS=CAISNQgQEitib3FfaWRlbnRpdHlmcm9udGVuZHVpc2VydmVyXzIwMjQwNTE0LjA2X3AwGgJmaSADGgYIgOu0sgY; SID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsycY4l9UFDIJHOY_QNNxj2VAACgYKARwSARYSFQHGX2Mi65hdDFLWe_lVN8kAKm4QDRoVAUF8yKq2_N54pnMPH8sNYo5oUVwX0076; __Secure-1PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyzCUf0kjJIJVSwB0ZYpZa5gACgYKASMSARYSFQHGX2Mi_oIgIZrhZGX_ITfAQdZGbhoVAUF8yKoD5h2D0m4Qlipei_3oaMVg0076; __Secure-3PSID=g.a000wAgkXB1lkcLyE2BTkCsCg4YZmBu74KlNybpV1uARU4p0brsyNYpZs6onqoCe9Yr0PVUgNgACgYKAe4SARYSFQHGX2Midnvu0VwGv4fEfZUkrYsqqxoVAUF8yKqzaUYlzPA_GJiYUeR73TMM0076; HSID=AdUsNXBEEgErocXCS; SSID=AEEA-JaRBcVmcpe4c; APISID=T0srsOCGoaTPKBwK/ARuj4hBtYbdQiHLtl; SAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-1PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; __Secure-3PAPISID=ZdowZW6i5S2-k7hz/Asj_ItHLuWNIGQqgt; SEARCH_SAMESITE=CgQI7J0B; NID=523=UJND95pUgMmjsMQIhhS2zpPnuIEYajYnUONE9qpFgFnNHmY3FqiwjffsG_4odtZyIDxmz2bTT7_HSB0uH_4HsCbPR1kjvi0JxYUbRCGcEXnuIYjQwF6l8PfuY7Z9VahuLY2s2XmlKal1-3ATfrCKSu17_1GIM0Y9vkOAne1JrOJdW2RLDPqgrpKke_uNoUhPL54IlfiTLqu6aCDPIxwatDRoUGwcqI228ITDAiegnHMII3nqH0Qgso0_QKHQrthhSWo-bryBzvirL8D194kpHprOakqEL6RPxEiQaU_mrki_wlroC7C4Z0qHpO3q0cINP6tTCb3Qv_cQ9yS_VgHKtxnRtNhrju_HDQUrwD1qFPQommDAvrhgnnmLSxgH1Pcths44jqeTGNYxQRCp5nHBZde4hxCqh9kpO8Xbx425gOYld0szaAri1RLxhNZN8f3lSB-Im2WNeWnQYhkLQHv7tpn8lh-2UK-Tr7_R27t1a7Bvs1ENWJs86tiuO6T3Z_J3ZMxCHFlFYG1_8btZO6LpgqMAioFMVOw3z6gpjsiRmYkdhAZCpKdIBE61D6K0NAc9YmUa89ypVAUqqzaZhH77Szg71pMX5StQqev_pCxWba_UIyxL2eFLhmtTSrh7HRE2bs4yCJ82czgGYgXhr31ktdd-xe3X5K8_3os4poUk7hJ-mB6mgk_LUHTgXb-5w80-vF-Z-l-3kP7TjZGTxR_ue0aZkg5JWSdnXQldMNcH8wALjzPFekp14_wxvJZ1XXUTIoryhZj55l0U-nnJtS31a0C9hYFeOnYjtlWSpit0wU3Hb6ltUlYFyvrVn6Jm2qwW_uRBa5gJJv4fgGyBPc5GHMoRrRIop_EXvu_rAjqEVqU2hXT1orgH4Bv2aou7ZDxxX4hEp9II8zJ3HyYWrSMla_R6UZtNzh34bmCDGRKVHxHXMRX8jwhQn84MTH4tMO9P6MkBPY5mtU-xie2DqhW50c-ycxitRp0Uklbdfdzc4shVI8mIcg1rczIugIvqDLEm6p3t0nrrrY7t-sRF2YlVr_No-tUUhoZjJ976RGCYRte3zM7-cKfdZCnuGuAmfLGqnMhBGLLLXg; AEC=AVcja2dUScCfVXvXbqFbsx9tKmD20laHMM2PmAJrPsxn3_IYxQZVwvyT4SI; __Secure-1PSIDTS=sidts-CjIBjplskEJd033W2HTwjOzU393EDZtbCtlolFGBZU1AHv1_CLLnocjMMuwaLNKg7VQTKhAA; __Secure-3PSIDTS=sidts-CjIBjplskEJd033W2HTwjOzU393EDZtbCtlolFGBZU1AHv1_CLLnocjMMuwaLNKg7VQTKhAA; SIDCC=AKEyXzV8apo1VT0zIx6A3ncjY64ess7kHIb6Wb12iZFhvZCNXzWx_uwsJ_Kr4bnUAJ2urB-x1Og; __Secure-1PSIDCC=AKEyXzUJZTh4zfpmdb-lcwZee6RCJHSP6iOGpuS7YNSbOxoZs6t_xN0nuQrwJRwCyiaWZZIrNbk; __Secure-3PSIDCC=AKEyXzVRWP6iNvD_ElliauFXT7fTEzSHyElqq54Ld_wjDoRrJx4zPql3ftzR6ddmgNQk-zfokU76");



export const pooling = async (videoId:string) =>{
    // const raw = "[\"c49f5963-8cc9-444c-9883-3ea2ff0fabc2\",\"CmxfU1ZJX0VKNzJrLWVuZ0kwREdCQWlQMDFCUlVSSVpsOXhPVzlaTTBzd1FtVnVaakIzVHkweWJEbEJhR1pYWDFNd2JUaGpRakJEYVZGU1kwWkpNVFF3Vms1TlNWTmthazlXVFhGV2QzVlBUUV8\"]";

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: videoId,
      redirect: "follow" as RequestRedirect
    };
    // let finalid:string;
    // let keepcontinue = true;
    // while(keepcontinue){
    const res = await fetch("https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GetGenerateVideoOperation", requestOptions)
    const data = await res.json();
    console.log(data);
    return data;
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // }

}

// export const acces = async(videoid:string)=>{
//     // const requestOptions = {
//     //     method: "GET",
//     //     headers: myHeaders,
//     //     redirect: "follow"
//     //   };

//     const res= await  fetch(`https://www.googleapis.com/drive/v3/files/${videoid}?alt=media`, {
//         "headers": {
//           "accept": "*/*",
//           "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
//           "authorization": "SAPISIDHASH 1746039747_5b01aff5d8644cd4f3f211e68d6989bff0e0e369 SAPISID1PHASH 1746039747_5b01aff5d8644cd4f3f211e68d6989bff0e0e369 SAPISID3PHASH 1746039747_5b01aff5d8644cd4f3f211e68d6989bff0e0e369",
//             "priority": "u=1, i",
//           "sec-ch-ua": "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"",
//           "sec-ch-ua-arch": "\"x86\"",
//           "sec-ch-ua-bitness": "\"64\"",
//           "sec-ch-ua-form-factors": "\"Desktop\"",
//           "sec-ch-ua-full-version": "\"135.0.7049.52\"",
//           "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"",
//           "sec-ch-ua-mobile": "?0",
//           "sec-ch-ua-model": "\"\"",
//           "sec-ch-ua-platform": "\"Linux\"",
//           "sec-ch-ua-platform-version": "\"6.14.3\"",
//           "sec-ch-ua-wow64": "?0",
//           "sec-fetch-dest": "empty",
//           "sec-fetch-mode": "cors",
//           "sec-fetch-site": "cross-site",
//           "x-client-data": "CJG2yQEIorbJAQipncoBCLL8ygEIlKHLAQiSo8sBCIegzQEIuMjNAQi81c4BCJPnzgEIuufOAQjP6M4BCLztzgE="
//         },
//         "referrer": "https://aistudio.google.com/",
//         "referrerPolicy": "origin",
//         "body": null,
//         "method": "GET",
//         "mode": "cors",
//         "credentials": "include"
//       });
//       const data =await res.text()
//       console.log(data);
// }

export const accessvideo = async(videoId : string) =>{
  console.log(videoId);
//   const myHeaders = new Headers();
// myHeaders.append("accept", "*/*");
// myHeaders.append("accept-language", "en-US,en;q=0.9");
// myHeaders.append("authorization", "SAPISIDHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5 SAPISID1PHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5 SAPISID3PHASH 1746042262_ece503a7e407be947498ac573e76d1973f2a9ec5");
// myHeaders.append("content-type", "application/json+protobuf");
// myHeaders.append("origin", "https://aistudio.google.com");
// myHeaders.append("priority", "u=1, i");
// myHeaders.append("referer", "https://aistudio.google.com/");
// myHeaders.append("sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"");
// myHeaders.append("sec-ch-ua-arch", "\"x86\"");
// myHeaders.append("sec-ch-ua-bitness", "\"64\"");
// myHeaders.append("sec-ch-ua-form-factors", "\"Desktop\"");
// myHeaders.append("sec-ch-ua-full-version", "\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-full-version-list", "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"");
// myHeaders.append("sec-ch-ua-mobile", "?0");
// myHeaders.append("sec-ch-ua-model", "\"\"");
// myHeaders.append("sec-ch-ua-platform", "\"Linux\"");
// myHeaders.append("sec-ch-ua-platform-version", "\"6.14.3\"");
// myHeaders.append("sec-ch-ua-wow64", "?0");
// myHeaders.append("sec-fetch-dest", "empty");
// myHeaders.append("sec-fetch-mode", "cors");
// myHeaders.append("sec-fetch-site", "same-site");
// myHeaders.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
// myHeaders.append("x-client-data", "CJG2yQEIorbJAQipncoBCLL8ygEIlKHLAQiSo8sBCIegzQEIuMjNAQi81c4BCJPnzgEIuufOAQjP6M4BCLztzgE=");
// myHeaders.append("x-goog-api-key", "AIzaSyDdP816MREB3SkjZO04QXbjsigfcI0GWOs");
// myHeaders.append("x-goog-authuser", "0");
// myHeaders.append("x-goog-ext-519733851-bin", "CAASAUQwATgEQAA=");
// myHeaders.append("x-user-agent", "grpc-web-javascript/0.1");
// myHeaders.append("Cookie", "SEARCH_SAMESITE=CgQI6Z0B; AEC=AVcja2dSxxE6k8jELP0DFagfRmkFWod0QkX3IHo1kUy1d-mT27J03eqKIT0; __Secure-1PSIDTS=sidts-CjEBjplskAXM8x6zehLG6Dy1FeSfymE2VHPlEMaefIsN47aSjEEISf-3Lt2ixbor_wIgEAA; __Secure-3PSIDTS=sidts-CjEBjplskAXM8x6zehLG6Dy1FeSfymE2VHPlEMaefIsN47aSjEEISf-3Lt2ixbor_wIgEAA; NID=523=MBMQAYdb-C4o-K-lyByXw2sf3ElOt-oLjMPv7Puse3Aj6K7eXhAYi7xytjbXnd8fMuHY_hGu9RNpKbGTNambfdfa-jZYxnwIqEn-UiezALVAcUOEabakZ0zdOp37U0SmHMQtA_aQauKUBHjWUhhYfcEkLJTA9kqRuGioxLGOYCvpp3aH67SPSHMfC3BF8gkBZz9rgNnH-rBBNwVqgPRuwmMvbXCZiBIC8j1U5z8rQMz0BeiaApTfV9S76MkxvYJE8DEJmiOdm9BxdLIS7SikGitKHyW1-PahXpAGZP4JqI7KMEp6zy1SZk7lKLLpetq3rc0Gq3KqxME7LizqlHMNiVeqyywQzPtPke83uysULH7ISgoW43RxZEjnUtHVnCS16rHpXaRwX3vRFPjBzAXVLuXuI8HHLF0lI0vuS-4jHXeelGyzaYEMZkDJ0x7MZIzvnyuHP4hCnapZC-V6nr7GpX4_ytcxIw-f62Oc5zW9PO1L1KlJqWThpp74F2LZF0qoZDP913qz26xz_soCsCIQq7XGgU2yLHNfjs77JYKzp1HjG8vqtQpSdmiQVZSVrT3oxT8ZpCKypp_5etwQ4HgP7vT0GdSCAJbj7h2UGw-KxtNyPllZC3X-bMloJ1V5BjTzNj-O3GuPail724NKFY9oNnPZTvHqpvPIi_1pShrJV0qm; SID=g.a000wgg8R3Lyi0AZ2VllfZMTGv8FKtPZODn8R72_4unTCdkLk0craVCo3r-ijHGfISAfwQJFvwACgYKAYcSARISFQHGX2Mig0F47Vg9qlsLNMfLhMsf0BoVAUF8yKoXnU1NldvQuEjZMCVLwMWw0076; __Secure-1PSID=g.a000wgg8R3Lyi0AZ2VllfZMTGv8FKtPZODn8R72_4unTCdkLk0crcMle1IWJVVnwOhfBDc4NYwACgYKAbISARISFQHGX2MipGCjHF7XmB4vcFiDk5ueCxoVAUF8yKpeRyoYfBvJS3IcV8zqtQFc0076; __Secure-3PSID=g.a000wgg8R3Lyi0AZ2VllfZMTGv8FKtPZODn8R72_4unTCdkLk0crtxBkzBUaPziUPagyGhtxDwACgYKAZ8SARISFQHGX2Mi1YfR3BI7Te8JEk0rBlYDRxoVAUF8yKqRJIkP_4fKdkGVlXs-NeDA0076; HSID=ARCWVbcgsR3-J8c3N; SSID=AA-q_D9WzNa2E1XuL; APISID=IzbTPhvyqoOC1NrU/AZZT3pa9MBu9QXCQ1; SAPISID=vJYmkOv-3G89jAJO/AGwsBr_vtVT-kASV5; __Secure-1PAPISID=vJYmkOv-3G89jAJO/AGwsBr_vtVT-kASV5; __Secure-3PAPISID=vJYmkOv-3G89jAJO/AGwsBr_vtVT-kASV5; SIDCC=AKEyXzVLwqcje-l62Xp5p5WgLBbG4gWKtclHH4pgzPe2RSt_lz51yC9MMGf1HCl1Gl2L9OhOtMs; __Secure-1PSIDCC=AKEyXzUEbvILVfNUSFEXSiRpW_1dSrZkvlQuctNNy8Um7FcX3k8Qka78mKPb2KsW-OZWT2L-iao; __Secure-3PSIDCC=AKEyXzUE44y59grswLz2zugmMG-LHre8DyMl18I3VNAsEnh2ejLxhWlEBuZHqd2H2bkdeQ-s2ss; SIDCC=AKEyXzUEsD54L5T9JAXZXu9MsFFZAnMS5mvEYYUpyGpahYQFgqV7KxBTGa3xKOGY9HJDu3kYSkg; __Secure-1PSIDCC=AKEyXzUIasqnGV-uIT4Uo_s8gOdXqyk_9lxZPamaVtN4LO6Lfrjle2lBHf-UePO60VP2JEbG0Yo; __Secure-3PSIDCC=AKEyXzUsl25CPF2n7jRCevOsZuoP1oNZj0VzAnxoFIaWbKXieQgy3PuuloqvDJx6DPIcidnNXTEX");

const raw = "[\"users/me\"]";

const requestOptions1 = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow" as RequestRedirect
};

const token = await fetch("https://alkalimakersuite-pa.clients6.google.com/$rpc/google.internal.alkali.applications.makersuite.v1.MakerSuiteService/GenerateAccessToken", requestOptions1)
const tokenData = await token.json();
console.log(tokenData);
console.log(tokenData[0]);
const accessToken = tokenData[0];

  const videoHeader = new Headers();
videoHeader.append("accept", "*/*");
videoHeader.append("accept-language", "en-GB,en-US;q=0.9,en;q=0.8");
videoHeader.append("authorization", `Bearer ${accessToken}`);
videoHeader.append("dnt", "1");
videoHeader.append("origin", "https://aistudio.google.com");
videoHeader.append("priority", "u=1, i");
videoHeader.append("referer", "https://aistudio.google.com/");
videoHeader.append("sec-ch-ua", "\"Google Chrome\";v=\"135\", \"Not-A.Brand\";v=\"8\", \"Chromium\";v=\"135\"");
videoHeader.append("sec-ch-ua-arch", "\"x86\"");
videoHeader.append("sec-ch-ua-bitness", "\"64\"");
videoHeader.append("sec-ch-ua-form-factors", "\"Desktop\"");
videoHeader.append("sec-ch-ua-full-version", "\"135.0.7049.52\"");
videoHeader.append("sec-ch-ua-full-version-list", "\"Google Chrome\";v=\"135.0.7049.52\", \"Not-A.Brand\";v=\"8.0.0.0\", \"Chromium\";v=\"135.0.7049.52\"");
videoHeader.append("sec-ch-ua-mobile", "?0");
videoHeader.append("sec-ch-ua-model", "\"\"");
videoHeader.append("sec-ch-ua-platform", "\"Linux\"");
videoHeader.append("sec-ch-ua-platform-version", "\"6.14.3\"");
videoHeader.append("sec-ch-ua-wow64", "?0");
videoHeader.append("sec-fetch-dest", "empty");
videoHeader.append("sec-fetch-mode", "cors");
videoHeader.append("sec-fetch-site", "cross-site");
videoHeader.append("user-agent", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
videoHeader.append("x-client-data", "CJG2yQEIorbJAQipncoBCLL8ygEIlaHLAQiSo8sBCIegzQEIuMjNAQi81c4BCO/mzgEIk+fOAQi6584BCM/ozgEIvO3OAQjd7s4B");

const requestOptions = {
  method: "GET",
  headers: videoHeader,
  redirect: "follow" as RequestRedirect
};

const res = await fetch(`https://www.googleapis.com/drive/v3/files/${videoId}?alt=media`, requestOptions);
const videoBuffer = await res.arrayBuffer();

// Convert ArrayBuffer to base64
const base64Video = Buffer.from(videoBuffer).toString('base64');
const videoData = `data:video/mp4;base64,${base64Video}`;

try {
  // Upload to Cloudinary
  const uploadResponse = await cloudinary.uploader.upload(videoData, {
    resource_type: "video",
    folder: "generated-videos",
    eager: [
      { format: "mp4", quality: "auto" }
    ]
  });

  return {
    success: true,
    videoUrl: uploadResponse.secure_url,
    publicId: uploadResponse.public_id
  };
} catch (error) {
  console.error("Error uploading to Cloudinary:", error);
  throw error;
}

}
