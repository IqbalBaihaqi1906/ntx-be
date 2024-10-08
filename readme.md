# Instruksi khusus dalam mengerjakan ujian teknis Back-End:

0. Tanyakan semua pertanyaan di bawah ini ke ChatGPT sebelum mengerjakan sendiri. Lakukan komparasi jawabanmu dengan jawaban ChatGPT.

1. Lakukan Refactor function 'refactoreMe1' dan 'refactoreMe2' agar function tersebut lebih mudah dibaca. Pada proses Refactor wajib memakai query native (raw query). Dataset disediakan di folder files.

- jawab => sudah di selesaikan dengan anggapan refactorMe 1 adalah untuk mencari rata-rata values dari survey dan refactorMe2 jika dosurvernya sudah true, tidak bisa melakukan survey

2. Buatkan endpoint berbasis websocket untuk melakukan fetch data dari api https://livethreatmap.radware.com/api/map/attacks?limit=10 dengan ketentuan fetch 3 menit sekali. Tulis code-mu di callmeWebSocket function.

- jawab => sudah diselesaikan dengan note hanya me-store 30 data pertama saja karena datanya terlalu banyak

3. Simpan data dari https://livethreatmap.radware.com/api/map/attacks?limit=10 ke database postgres, buatkan 1 endpoint sederhana untuk mendapatkan angka jumlah "destinationCountry" yang diserang dan "sourcecountry" yang menyerang. Tulis code-mu di getData function menggunakan query native (raw query). Sesuaikan hasil respon seperti di bawah ini:

- jawab => endpoint disini menerima query "type" untuk menentukan dia mau nerima destinationCountry atau sourceCountry

```
{
  success:true,
  statusCode:200,
  data:{
    label:["Indonesia","Singapore","China"]
    total:[200,200,200]
  }
}
```

4. Implementasikan redis catching pada saat melakukan fetch endpoint yang telah dibuat sebelumnya pada nomor 3.

- jawab => sudah diselesaikan dengan note key redis akan expired dalam 3 menit

5. Buatkan middleware autentikasi jwt untuk melakukan proteksi API dan middleware yang berfungsi membatasi endpoint lain berdasarkan role user. Contoh: User A memiliki token valid, tetapi User A tidak memiliki role valid, sehingga User A tidak dapat membuka beberapa endpoint.

- jawab => sudah diselesaikan, saya menambahkan kolom role dan password di file sql dan model user, default passwordnya adalah "user123" dan menggunakan digits untuk login karena itu unique, contoh penggunaan authorizationnya juga sudah ada di routes untuk membatasi endpoint berdasarkan role

6. Buatkan unit test untuk melakukan test endpoint untuk memastikan endpoint tersebut berjalan dengan baik.

- jawab => sudah selesai dengan keterangan test resultnya

7. Push hasil test ke github.
