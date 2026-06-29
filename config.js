const CONFIG = {
  categories: [
    {
      id: "auto_basis",
      title: "AUTO",
      subtitle: "basistraining",
      duration: "± 20 min.",
      bgImage: "knoppen/auto_basis.webp",
      theme: "dark", // Means text will be dark (e.g. for a solid light blue BG) or we can use "light" for white text over a blurred image
      videos: [
        { 
            id: 1, 
            videoA: "animaties/auto/Video 1/Blikveld_1.mp4", 
            videoB: "animaties/auto/Video 1/Blikveld_1-volledig.mp4",
            expertImages: [
                { src: "animaties/auto/Video 1/Blikveld_1-0.jpg", text: "Zoals je in de video hebt kunnen zien, blokkeert de vrachtwagen hier jouw zicht. Hierdoor kun je niet goed zien dat er een auto van links komt." },
                { src: "animaties/auto/Video 1/Blikveld_1-1.jpg", text: "Dit betekent ook dat de auto die van links komt, jou ook niet ziet." },
                { src: "animaties/auto/Video 1/Blikveld_1-2.jpg", text: "Het kan gebeuren dat de vrachtwagen met oplegger te langzaam de weg op rijdt. Hierdoor wordt jouw weg geblokkeerd." },
                { src: "animaties/auto/Video 1/Blikveld_1-3.jpg", text: "Er kan nog een auto achter de vrachtwagen aanrijden. Door de bosjes en bomen aan de rechterkant kunnen jij en deze auto elkaar minder goed zien." },
                { src: "animaties/auto/Video 1/Blikveld_1-4.jpg", text: "Je rijdt met een bepaalde snelheid over deze doorgaande weg. De auto die van rechts komt kan de situatie verkeerd inschatten en denken dat hij er nog voor kan." }
            ]
        },
        { id: 2, videoA: "animaties/auto/Video 2/Blikveld_2.mp4", videoB: "animaties/auto/Video 2/Blikveld_2-volledig.mp4" },
        { id: 3, videoA: "animaties/auto/Video 3/Blikveld_3.mp4", videoB: "animaties/auto/Video 3/Blikveld_3-volledig.mp4" },
        { id: 4, videoA: "animaties/auto/Video 4/Blikveld_4.mp4", videoB: "animaties/auto/Video 4/Blikveld_4-volledig.mp4" }
      ]
    },
    {
      id: "auto_vervolg",
      title: "AUTO 2",
      subtitle: "vervolgtraining",
      duration: "± 20 min.",
      bgImage: "knoppen/auto_vervolg.webp",
      theme: "light",
      videos: [
        { id: 5, videoA: "animaties/auto/Video 5/Blikveld_5.mp4", videoB: "animaties/auto/Video 5/Blikveld_5-volledig.mp4" },
        { id: 6, videoA: "animaties/auto/Video 6/Blikveld_6.mp4", videoB: "animaties/auto/Video 6/Blikveld_6-volledig.mp4" },
        { id: 7, videoA: "animaties/auto/Video 7/Blikveld_7.mp4", videoB: "animaties/auto/Video 7/Blikveld_7-volledig.mp4" },
        { id: 8, videoA: "animaties/auto/Video 8/Blikveld_8.mp4", videoB: "animaties/auto/Video 8/Blikveld_8-volledig.mp4" }
      ]
    },
    {
      id: "fiets_basis",
      title: "FIETS &\nE-BIKE",
      subtitle: "basistraining",
      duration: "± 20 min.",
      bgImage: "knoppen/fiets_basis.webp",
      theme: "light",
      videos: [
        { id: 1, videoA: "animaties/fiets_e-bike/situatie_1_A.mp4", videoB: "animaties/fiets_e-bike/situatie_1_B.mp4" },
        { id: 2, videoA: "animaties/fiets_e-bike/situatie_2_A.mp4", videoB: "animaties/fiets_e-bike/situatie_2_B.mp4" },
        { id: 3, videoA: "animaties/fiets_e-bike/situatie_3_A.mp4", videoB: "animaties/fiets_e-bike/situatie_3_B.mp4" },
        { id: 4, videoA: "animaties/fiets_e-bike/situatie_4_A.mp4", videoB: "animaties/fiets_e-bike/situatie_4_B.mp4" }
      ]
    },
    {
      id: "fiets_vervolg",
      title: "FIETS &\nE-BIKE 2",
      subtitle: "vervolgtraining",
      duration: "± 20 min.",
      bgImage: "knoppen/fiets_vervolg.webp",
      theme: "dark",
      videos: [
        { id: 5, videoA: "animaties/fiets_e-bike/situatie_5_A.mp4", videoB: "animaties/fiets_e-bike/situatie_5_B.mp4" },
        { id: 6, videoA: "animaties/fiets_e-bike/situatie_6_A.mp4", videoB: "animaties/fiets_e-bike/situatie_6_B.mp4" },
        { id: 7, videoA: "animaties/fiets_e-bike/situatie_7_A.mp4", videoB: "animaties/fiets_e-bike/situatie_7_B.mp4" },
        { id: 8, videoA: "animaties/fiets_e-bike/situatie_8_A.mp4", videoB: "animaties/fiets_e-bike/situatie_8_B.mp4" }
      ]
    },
    {
      id: "scooter_basis",
      title: "SCOOTER",
      subtitle: "basistraining",
      duration: "± 20 min.",
      bgImage: "knoppen/scooter_basis.webp",
      theme: "dark",
      videos: [
        { id: 2, videoA: "animaties/scooter/2. Kruispunt Sneeuw_1.mp4", videoB: "animaties/scooter/2.1 Kruispunt Sneeuw uitleg_1.mp4" },
        { id: 3, videoA: "animaties/scooter/3. Landweg_1.mp4", videoB: "animaties/scooter/3.1 Landweg uitleg_1.mp4" },
        { id: 4, videoA: "animaties/scooter/4. Skateboarder_1.mp4", videoB: "animaties/scooter/4.1 Skateboarder uitleg_1.mp4" },
        { id: 5, videoA: "animaties/scooter/5. Openslaande deur_1.mp4", videoB: "animaties/scooter/5.1 Openslaande deur uitleg_1.mp4" }
      ]
    },
    {
      id: "scooter_vervolg",
      title: "SCOOTER 2",
      subtitle: "vervolgtraining",
      duration: "± 20 min.",
      bgImage: "knoppen/scooter_vervolg.webp",
      theme: "dark",
      videos: [
        { id: 6, videoA: "animaties/scooter/6. Rechtdoor zelfde weg gaat voor_1.mp4", videoB: "animaties/scooter/6.1 Rechtdoor zelfde weg gaat voor uitleg_1.mp4" },
        { id: 7, videoA: "animaties/scooter/7. Tram_1.mp4", videoB: "animaties/scooter/7.1 Tram uitleg_1.mp4" },
        { id: 8, videoA: "animaties/scooter/8. Woonerf_1.mp4", videoB: "animaties/scooter/8.1 Woonerf uitleg_1.mp4" },
        { id: 9, videoA: "animaties/scooter/9. Wegwerker_1.mp4", videoB: "animaties/scooter/9.1 Wegwerker uitleg_1.mp4" }
      ]
    }
  ]
};
