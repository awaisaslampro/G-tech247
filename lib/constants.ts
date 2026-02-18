export const POSITION_OPTIONS = [
  "Desktop Support Specialist",
  "Network Engineer"
];

export type CityCoverageOption = {
  name: string;
  lat?: number;
  lng?: number;
};

export const CITIES_BY_COUNTRY = {
  Albania: [{ name: "Tirana", lat: 41.3275, lng: 19.8187 }],
  Andorra: [{ name: "Andorra la Vella", lat: 42.5063, lng: 1.5218 }],
  Austria: [
    { name: "Vienna", lat: 48.2082, lng: 16.3738 },
    { name: "Salzburg", lat: 47.8095, lng: 13.055 }
  ],
  Belarus: [{ name: "Minsk", lat: 53.9006, lng: 27.559 }],
  Belgium: [
    { name: "Brussels", lat: 50.8503, lng: 4.3517 },
    { name: "Antwerp", lat: 51.2194, lng: 4.4025 }
  ],
  "Bosnia and Herzegovina": [{ name: "Sarajevo", lat: 43.8563, lng: 18.4131 }],
  Bulgaria: [
    { name: "Sofia", lat: 42.6977, lng: 23.3219 },
    { name: "Plovdiv", lat: 42.1354, lng: 24.7453 }
  ],
  Croatia: [
    { name: "Zagreb", lat: 45.815, lng: 15.9819 },
    { name: "Split", lat: 43.5081, lng: 16.4402 }
  ],
  Cyprus: [
    { name: "Nicosia", lat: 35.1856, lng: 33.3823 },
    { name: "Limassol", lat: 34.7071, lng: 33.0226 }
  ],
  "Czech Republic": [
    { name: "Prague", lat: 50.0755, lng: 14.4378 },
    { name: "Brno", lat: 49.1951, lng: 16.6068 }
  ],
  Denmark: [
    { name: "Copenhagen", lat: 55.6761, lng: 12.5683 },
    { name: "Aarhus", lat: 56.1629, lng: 10.2039 }
  ],
  Estonia: [
    { name: "Tallinn", lat: 59.437, lng: 24.7536 },
    { name: "Tartu", lat: 58.3776, lng: 26.729 }
  ],
  Finland: [
    { name: "Helsinki", lat: 60.1699, lng: 24.9384 },
    { name: "Tampere", lat: 61.4978, lng: 23.761 }
  ],
  France: [
    { name: "Paris", lat: 48.8566, lng: 2.3522 },
    { name: "Lyon", lat: 45.764, lng: 4.8357 }
  ],
  Germany: [
    { name: "Berlin", lat: 52.52, lng: 13.405 },
    { name: "Munich", lat: 48.1351, lng: 11.582 }
  ],
  Greece: [
    { name: "Athens", lat: 37.9838, lng: 23.7275 },
    { name: "Thessaloniki", lat: 40.6401, lng: 22.9444 }
  ],
  Hungary: [
    { name: "Budapest", lat: 47.4979, lng: 19.0402 },
    { name: "Debrecen", lat: 47.5316, lng: 21.6273 }
  ],
  Iceland: [
    { name: "Reykjavik", lat: 64.1466, lng: -21.9426 },
    { name: "Akureyri", lat: 65.6885, lng: -18.1262 }
  ],
  Ireland: [
    { name: "Dublin", lat: 53.3498, lng: -6.2603 },
    { name: "Cork", lat: 51.8985, lng: -8.4756 }
  ],
  Italy: [
    { name: "Rome", lat: 41.9028, lng: 12.4964 },
    { name: "Milan", lat: 45.4642, lng: 9.19 }
  ],
  Kosovo: [
    { name: "Pristina", lat: 42.6629, lng: 21.1655 },
    { name: "Prizren", lat: 42.2139, lng: 20.7397 }
  ],
  Latvia: [
    { name: "Riga", lat: 56.9496, lng: 24.1052 },
    { name: "Daugavpils", lat: 55.8747, lng: 26.5362 }
  ],
  Liechtenstein: [{ name: "Vaduz", lat: 47.141, lng: 9.5209 }],
  Lithuania: [
    { name: "Vilnius", lat: 54.6872, lng: 25.2797 },
    { name: "Kaunas", lat: 54.8985, lng: 23.9036 }
  ],
  Luxembourg: [{ name: "Luxembourg City", lat: 49.6116, lng: 6.1319 }],
  Malta: [
    { name: "Valletta", lat: 35.8989, lng: 14.5146 },
    { name: "Birkirkara", lat: 35.8955, lng: 14.4665 }
  ],
  Moldova: [
    { name: "Chisinau", lat: 47.0105, lng: 28.8638 },
    { name: "Balti", lat: 47.7631, lng: 27.929 }
  ],
  Monaco: [{ name: "Monaco", lat: 43.7384, lng: 7.4246 }],
  Montenegro: [
    { name: "Podgorica", lat: 42.4304, lng: 19.2594 },
    { name: "Niksic", lat: 42.7731, lng: 18.9445 }
  ],
  Netherlands: [
    { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
    { name: "Rotterdam", lat: 51.9244, lng: 4.4777 }
  ],
  "North Macedonia": [
    { name: "Skopje", lat: 41.9973, lng: 21.428 },
    { name: "Bitola", lat: 41.0319, lng: 21.3347 }
  ],
  Norway: [
    { name: "Oslo", lat: 59.9139, lng: 10.7522 },
    { name: "Bergen", lat: 60.3913, lng: 5.3221 }
  ],
  Poland: [
    { name: "Warsaw", lat: 52.2297, lng: 21.0122 },
    { name: "Krakow", lat: 50.0647, lng: 19.945 }
  ],
  Portugal: [
    { name: "Lisbon", lat: 38.7223, lng: -9.1393 },
    { name: "Porto", lat: 41.1579, lng: -8.6291 },
    { name: "Vila Nova de Gaia", lat: 41.1333, lng: -8.6167 },
    { name: "Amadora", lat: 38.7538, lng: -9.2308 },
    { name: "Braga", lat: 41.5454, lng: -8.4265 },
    { name: "Funchal", lat: 32.6669, lng: -16.9241 },
    { name: "Coimbra", lat: 40.2033, lng: -8.4103 },
    { name: "Almada", lat: 38.6803, lng: -9.1588 },
    { name: "Agualva-Cacem", lat: 38.7669, lng: -9.2972 },
    { name: "Cascais", lat: 38.6979, lng: -9.4215 },
    { name: "Oeiras", lat: 38.697, lng: -9.3017 },
    { name: "Odivelas", lat: 38.7936, lng: -9.1838 },
    { name: "Matosinhos", lat: 41.178, lng: -8.689 },
    { name: "Maia", lat: 41.2357, lng: -8.6199 },
    { name: "Gondomar", lat: 41.15, lng: -8.5333 },
    { name: "Setubal", lat: 38.5244, lng: -8.8882 },
    { name: "Sintra", lat: 38.8029, lng: -9.3817 },
    { name: "Aveiro", lat: 40.6405, lng: -8.6538 },
    { name: "Leiria", lat: 39.7436, lng: -8.8071 },
    { name: "Viseu", lat: 40.661, lng: -7.9097 },
    { name: "Guimaraes", lat: 41.4444, lng: -8.2962 },
    { name: "Viana do Castelo", lat: 41.6946, lng: -8.8302 },
    { name: "Barcelos", lat: 41.5317, lng: -8.6199 },
    { name: "Vila Real", lat: 41.3006, lng: -7.7441 },
    { name: "Braganca", lat: 41.806, lng: -6.7567 },
    { name: "Chaves", lat: 41.7407, lng: -7.4684 },
    { name: "Castelo Branco", lat: 39.8222, lng: -7.4909 },
    { name: "Covilha", lat: 40.2811, lng: -7.505 },
    { name: "Guarda", lat: 40.5373, lng: -7.2679 },
    { name: "Evora", lat: 38.5714, lng: -7.9135 },
    { name: "Beja", lat: 38.0151, lng: -7.8632 },
    { name: "Santarem", lat: 39.2367, lng: -8.685 },
    { name: "Portalegre", lat: 39.2967, lng: -7.4287 },
    { name: "Faro", lat: 37.0194, lng: -7.9322 },
    { name: "Loule", lat: 37.1378, lng: -8.022 },
    { name: "Portimao", lat: 37.1366, lng: -8.538 },
    { name: "Lagos", lat: 37.1028, lng: -8.6742 },
    { name: "Albufeira", lat: 37.0891, lng: -8.2479 },
    { name: "Tavira", lat: 37.127, lng: -7.648 },
    { name: "Vila Real de Santo Antonio", lat: 37.1942, lng: -7.4177 },
    { name: "Figueira da Foz", lat: 40.1508, lng: -8.8618 },
    { name: "Torres Vedras", lat: 39.0911, lng: -9.2586 },
    { name: "Caldas da Rainha", lat: 39.403, lng: -9.1355 },
    { name: "Alcobaca", lat: 39.5529, lng: -8.977 },
    { name: "Peniche", lat: 39.3558, lng: -9.3811 },
    { name: "Sines", lat: 37.9561, lng: -8.8698 },
    { name: "Ilhavo", lat: 40.6019, lng: -8.6682 },
    { name: "Vila Franca de Xira", lat: 38.9565, lng: -8.9897 },
    { name: "Ponta Delgada", lat: 37.7412, lng: -25.6756 },
    { name: "Angra do Heroismo", lat: 38.6568, lng: -27.2239 },
    { name: "Horta", lat: 38.5364, lng: -28.6265 },
    { name: "Machico", lat: 32.7157, lng: -16.767 },
    { name: "Santa Cruz", lat: 32.6888, lng: -16.7933 }
  ],
  Romania: [
    { name: "Bucharest", lat: 44.4268, lng: 26.1025 },
    { name: "Cluj-Napoca", lat: 46.7712, lng: 23.6236 }
  ],
  "San Marino": [{ name: "San Marino", lat: 43.9424, lng: 12.4578 }],
  Serbia: [
    { name: "Belgrade", lat: 44.7866, lng: 20.4489 },
    { name: "Novi Sad", lat: 45.2671, lng: 19.8335 }
  ],
  Slovakia: [
    { name: "Bratislava", lat: 48.1486, lng: 17.1077 },
    { name: "Kosice", lat: 48.7164, lng: 21.2611 }
  ],
  Slovenia: [
    { name: "Ljubljana", lat: 46.0569, lng: 14.5058 },
    { name: "Maribor", lat: 46.5547, lng: 15.6459 }
  ],
  Spain: [
    { name: "Madrid", lat: 40.4168, lng: -3.7038 },
    { name: "Barcelona", lat: 41.3874, lng: 2.1686 },
    { name: "Valencia", lat: 39.4699, lng: -0.3763 }
  ],
  Sweden: [
    { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
    { name: "Gothenburg", lat: 57.7089, lng: 11.9746 }
  ],
  Switzerland: [
    { name: "Zurich", lat: 47.3769, lng: 8.5417 },
    { name: "Geneva", lat: 46.2044, lng: 6.1432 }
  ],
  Turkey: [
    { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
    { name: "Ankara", lat: 39.9334, lng: 32.8597 }
  ],
  Ukraine: [
    { name: "Kyiv", lat: 50.4501, lng: 30.5234 },
    { name: "Lviv", lat: 49.8397, lng: 24.0297 }
  ],
  "United Kingdom": [
    { name: "London", lat: 51.5072, lng: -0.1276 },
    { name: "Croydon", lat: 51.3762, lng: -0.0982 },
    { name: "Watford", lat: 51.6565, lng: -0.3903 },
    { name: "Manchester", lat: 53.4808, lng: -2.2426 },
    { name: "Birmingham", lat: 52.4862, lng: -1.8904 },
    { name: "Leeds", lat: 53.8, lng: -1.5491 },
    { name: "Liverpool", lat: 53.4084, lng: -2.9916 },
    { name: "Bristol", lat: 51.4545, lng: -2.5879 },
    { name: "Glasgow", lat: 55.8642, lng: -4.2518 },
    { name: "Edinburgh", lat: 55.9533, lng: -3.1883 },
    { name: "Cardiff", lat: 51.4816, lng: -3.1791 },
    { name: "Belfast", lat: 54.5973, lng: -5.9301 }
  ],
  "Vatican City": [{ name: "Vatican City", lat: 41.9029, lng: 12.4534 }]
} satisfies Record<string, CityCoverageOption[]>;

export type CountryCoverageOption = keyof typeof CITIES_BY_COUNTRY;
export const COUNTRY_COVERAGE_OPTIONS = Object.keys(
  CITIES_BY_COUNTRY
) as CountryCoverageOption[];

export const CITY_PROXIMITY_KM = 35;

export const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];

export const ALLOWED_IDENTITY_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg"];
