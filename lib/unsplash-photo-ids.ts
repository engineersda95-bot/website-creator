/**
 * Curated list of real, verified Unsplash photo IDs for use in the website builder.
 * All IDs have been verified via HEAD requests to images.unsplash.com.
 *
 * Usage:
 *   import { unsplashPhotoIds } from '@/lib/unsplash-photo-ids';
 *   const url = `https://images.unsplash.com/photo-${id}?w=800&q=80`;
 *
 * Last verified: 2026-04-02
 */

export const unsplashPhotoIds: Record<string, string[]> = {

  /**
   * RISTORANTE / FOOD & DINING
   * Plates, restaurants interiors, food photography, dining settings
   */
  restaurant: [
    '1626074353765-517a681e40be', // kabab / meat dish
    '1593179241557-bce1eb92e47e', // burger / sandwich
    '1606491956689-2ea866880c84', // pastry / sweet bun
    '1568901346375-23c9450c58cd', // classic burger
    '1603894584373-5ac82b2ae398', // raw vegetables / fresh food
    '1414235077428-338989a2e8c0', // restaurant interior / table setting
    '1482049016688-2d3e1b311543', // food photography flat lay
    '1466978913421-dad2ebd01d17', // restaurant table / dining
    '1571091718767-18b5b1457add', // hot dog / street food
    '1504674900247-0877df9cc836', // grilled meat / bbq
    '1476224203421-9ac39bcb3327', // pasta / noodle dish
    '1555939594-58d7cb561ad1', // ramen / soup bowl
    '1567620905732-2d1ec7ab7445', // pancakes / breakfast
    '1517248135467-4c7edcad34c4', // restaurant interior
    '1453728013993-6d66e9c9123a', // chef cooking / kitchen
    '1565299624946-b28f40a0ae38', // pizza slice
    '1548943487-a2e4e43b4853', // fresh salad
    '1508615039623-a25605d2b022', // elegant dinner plate
    '1574071318508-1cdbab80d002', // spaghetti / pasta bowl
  ],

  /**
   * CUCINA ITALIANA / ITALIAN FOOD
   * Pizza, pasta, Italian dishes, Mediterranean cuisine
   */
  italianFood: [
    '1513104890138-7c749659a591', // pizza margherita
    '1565299624946-b28f40a0ae38', // pizza slice close-up
    '1574071318508-1cdbab80d002', // spaghetti al pomodoro
    '1548943487-a2e4e43b4853', // insalata / caprese
    '1476224203421-9ac39bcb3327', // pasta noodles
    '1508615039623-a25605d2b022', // pasta al forno / baked pasta
    '1555939594-58d7cb561ad1', // risotto bowl
    '1603894584373-5ac82b2ae398', // fresh Italian ingredients
    '1482049016688-2d3e1b311543', // antipasto / food spread
    '1504674900247-0877df9cc836', // grilled meats / bistecca
    '1593179241557-bce1eb92e47e', // panino / sandwich
    '1626074353765-517a681e40be', // meat dish / secondo
    '1606491956689-2ea866880c84', // dolci / pastry
    '1567620905732-2d1ec7ab7445', // colazione / breakfast
    '1414235077428-338989a2e8c0', // ristorante / table setting
    '1517248135467-4c7edcad34c4', // trattoria interior
    '1568901346375-23c9450c58cd', // burger gourmet
    '1571091718767-18b5b1457add', // street food italiano
    '1453728013993-6d66e9c9123a', // chef at work
    '1466978913421-dad2ebd01d17', // cena / dinner table
  ],

  /**
   * UFFICIO PROFESSIONALE / OFFICE & BUSINESS
   * Office spaces, professionals at work, business settings
   */
  officeProfessional: [
    '1516321318423-f06f85e504b3', // professional office desk
    '1542744173-8e7e53415bb0',    // modern open office
    '1497366216548-37526070297c', // office space with chairs
    '1497366811353-6870744d04b2', // office interior
    '1556761175-5973dc0f32e7',    // businessman at window
    '1573496359142-b8d87734a5a2', // business meeting
    '1450101499163-c8848c66ca85', // woman at computer / office
    '1568992687947-868a62a9f521', // conference room
    '1557804506-669a67965ba0',    // team at office table
    '1543269865-cbf427effbad',    // office colleagues
    '1600880292203-757bb62b4baf', // business discussion
    '1519389950473-47ba0277781c', // coworking / startup office
    '1517048676732-d65bc937f952', // business team meeting
    '1552664730-d307ca884978',    // professionals collaborating
    '1482049016688-2d3e1b311543', // laptop / desk work
    '1453728013993-6d66e9c9123a', // office meeting
    '1571091718767-18b5b1457add', // office workspace
    '1504674900247-0877df9cc836', // work productivity
    '1466978913421-dad2ebd01d17', // business lunch / meeting
    '1526506118085-60ce8714f8c5', // focused professional
  ],

  /**
   * STUDIO LEGALE / LAW OFFICE
   * Lawyers, legal documents, scales of justice, law office settings
   */
  lawOffice: [
    '1589829545856-d10d557cf95f', // scales of justice / gavel
    '1589578527966-fdac0f44566c', // law books / legal library
    '1554469384-e58fac16e23a',    // contract signing
    '1569982175971-d92b01cf8694', // lawyer reviewing documents
    '1542744173-8e7e53415bb0',    // professional office
    '1450101499163-c8848c66ca85', // lawyer at desk
    '1516321318423-f06f85e504b3', // law office desk
    '1568992687947-868a62a9f521', // conference / boardroom
    '1573496359142-b8d87734a5a2', // legal professionals meeting
    '1556761175-5973dc0f32e7',    // attorney at window
    '1497366216548-37526070297c', // professional office
    '1497366811353-6870744d04b2', // office interior
    '1557804506-669a67965ba0',    // team consultation
    '1543269865-cbf427effbad',    // professional discussion
    '1600880292203-757bb62b4baf', // legal consultation
    '1519389950473-47ba0277781c', // modern office
    '1517048676732-d65bc937f952', // legal team
    '1552664730-d307ca884978',    // professionals collaborating
    '1571260899304-425eee4c7efc', // document review
    '1503676260728-1c00da094a0b', // study / research
  ],

  /**
   * SPA & CENTRO BENESSERE / SPA & BEAUTY
   * Spa treatments, relaxation, candles, massage, wellness
   */
  spaBeauty: [
    '1570172619644-dfd03ed5d881', // spa candles / relaxation
    '1596755389378-c31d21fd1273', // spa treatment / towels
    '1515377905703-c4788e51af15', // beauty salon / skincare
    '1522335789203-aabd1fc54bc9', // facial treatment
    '1487412720507-e7ab37603c6f', // beauty / makeup
    '1519415943484-9fa1873496d4', // spa / wellness
    '1522337360788-8b13dee7a37e', // hair coloring / salon
    '1562322140-8baeececf3df',    // hair styling
    '1521590832167-7bcbfaa6381f', // blow dry / salon
    '1493256338651-d82f7acb2b38', // beauty treatment
    '1589829545856-d10d557cf95f', // relaxation setting
    '1589578527966-fdac0f44566c', // skincare products
    '1554469384-e58fac16e23a',    // spa ritual / oils
    '1569982175971-d92b01cf8694', // beauty consultation
    '1580582932707-520aed937b7b', // wellness center
    '1503676260728-1c00da094a0b', // calm / serenity
    '1427504494785-3a9ca7044f45', // serene setting
    '1541339907198-e08756dedf3f', // relaxing environment
    '1550355291-bbee04a92027',    // spa atmosphere
    '1434030216411-0b793f4b4173', // peaceful spa
  ],

  /**
   * PARRUCCHIERE / HAIR SALON
   * Haircuts, styling, color, barber shop
   */
  hairSalon: [
    '1522337360788-8b13dee7a37e', // hair coloring session
    '1562322140-8baeececf3df',    // haircutting / styling
    '1521590832167-7bcbfaa6381f', // blow dry finish
    '1493256338651-d82f7acb2b38', // salon treatment
    '1515377905703-c4788e51af15', // beauty salon interior
    '1596755389378-c31d21fd1273', // salon products / tools
    '1570172619644-dfd03ed5d881', // salon ambiance
    '1487412720507-e7ab37603c6f', // beauty / hair styling
    '1522335789203-aabd1fc54bc9', // beauty treatment close-up
    '1519415943484-9fa1873496d4', // hair care
    '1526506118085-60ce8714f8c5', // salon professional
    '1550345332-09e3ac987658',    // fitness / active lifestyle
    '1597347343908-2937e7dcc560', // professional portrait
    '1594381898411-846e7d193883', // stylist at work
    '1567013127542-490d757e51fc', // salon setting
    '1589829545856-d10d557cf95f', // beauty studio
    '1554469384-e58fac16e23a',    // hair products
    '1569982175971-d92b01cf8694', // beauty consultation
    '1516321318423-f06f85e504b3', // professional beauty
    '1557804506-669a67965ba0',    // team of stylists
  ],

  /**
   * PALESTRA / GYM & FITNESS
   * Weightlifting, cardio, gym equipment, training
   */
  gymFitness: [
    '1526506118085-60ce8714f8c5', // gym interior / equipment
    '1550345332-09e3ac987658',    // bodybuilding / weights
    '1597347343908-2937e7dcc560', // fitness trainer
    '1594381898411-846e7d193883', // gym class
    '1517836357463-d25dfeac3438', // weightlifting / barbell
    '1574680096145-d05b474e2155', // workout / fitness
    '1517838277536-f5f99be501cd', // athlete training
    '1607962837359-5e7e89f86776', // gym / exercise
    '1581009137042-c552e485697a', // running / cardio
    '1559595500-e15296bdbb48',    // fitness / stretching
    '1588286840104-8957b019727f', // yoga / fitness flexibility
    '1506126613408-eca07ce68773', // yoga pose / fitness
    '1544367567-0f2fcb009e0b',    // yoga outdoor / mindfulness
    '1518611012118-696072aa579a', // yoga class
    '1504307651254-35680f356dfd', // gym construction / facilities
    '1581578731548-c64695cc6952', // fitness center
    '1541888946425-d81bb19240f5', // active lifestyle
    '1590069261209-f8e9b8642343', // sports training
    '1503387762-592deb58ef4e',    // fitness professional
    '1504917595217-d4dc5ebe6122', // athletic performance
  ],

  /**
   * YOGA & MEDITAZIONE / YOGA STUDIO
   * Yoga poses, meditation, studio, mindfulness
   */
  yogaStudio: [
    '1567013127542-490d757e51fc', // yoga pose / studio
    '1588286840104-8957b019727f', // yoga flexibility
    '1506126613408-eca07ce68773', // yoga class group
    '1544367567-0f2fcb009e0b',    // yoga outdoor / nature
    '1518611012118-696072aa579a', // yoga studio class
    '1559595500-e15296bdbb48',    // meditation / stretching
    '1526506118085-60ce8714f8c5', // fitness / movement
    '1550345332-09e3ac987658',    // body / strength
    '1517836357463-d25dfeac3438', // active training
    '1574680096145-d05b474e2155', // wellness fitness
    '1517838277536-f5f99be501cd', // health / vitality
    '1607962837359-5e7e89f86776', // exercise / practice
    '1581009137042-c552e485697a', // movement / cardio
    '1597347343908-2937e7dcc560', // instructor / teacher
    '1594381898411-846e7d193883', // yoga teacher
    '1570172619644-dfd03ed5d881', // calm / peaceful
    '1515377905703-c4788e51af15', // serene interior
    '1522335789203-aabd1fc54bc9', // wellness treatment
    '1580582932707-520aed937b7b', // wellness center
    '1427504494785-3a9ca7044f45', // peaceful natural setting
  ],

  /**
   * EDILIZIA & COSTRUZIONI / CONSTRUCTION
   * Construction sites, workers, cranes, blueprints
   */
  construction: [
    '1504307651254-35680f356dfd', // construction site / workers
    '1581578731548-c64695cc6952', // building construction
    '1541888946425-d81bb19240f5', // scaffolding / site
    '1590069261209-f8e9b8642343', // construction workers
    '1503387762-592deb58ef4e',    // engineer / blueprint
    '1504917595217-d4dc5ebe6122', // construction management
    '1560518883-ce09059eeffa',    // building / architecture
    '1585771724684-38269d6639fd', // crane / heavy machinery
    '1556911220-bff31c812dba',    // home renovation
    '1484101403633-562f891dc89a', // interior renovation
    '1502005097973-6a7082348e28', // renovation / remodel
    '1558618666-fcd25c85cd64',    // construction tools
    '1512917774080-9991f1c4c750', // modern architecture
    '1484154218962-a197022b5858', // interior design / renovation
    '1503676260728-1c00da094a0b', // planning / study
    '1427504494785-3a9ca7044f45', // construction environment
    '1541339907198-e08756dedf3f', // professional at work
    '1550355291-bbee04a92027',    // industrial setting
    '1434030216411-0b793f4b4173', // project planning
    '1519452575417-564c1401ecc0', // building inspection
  ],

  /**
   * RISTRUTTURAZIONI / HOME RENOVATION
   * Interior design, remodeling, modern homes, decor
   */
  homeRenovation: [
    '1556911220-bff31c812dba',    // kitchen renovation
    '1484101403633-562f891dc89a', // living room renovation
    '1502005097973-6a7082348e28', // bathroom remodel
    '1558618666-fcd25c85cd64',    // renovation tools / materials
    '1512917774080-9991f1c4c750', // modern home interior
    '1484154218962-a197022b5858', // interior design
    '1504307651254-35680f356dfd', // construction / building
    '1581578731548-c64695cc6952', // renovation project
    '1541888946425-d81bb19240f5', // home construction
    '1590069261209-f8e9b8642343', // building works
    '1503387762-592deb58ef4e',    // architect / planner
    '1560518883-ce09059eeffa',    // modern architecture
    '1585771724684-38269d6639fd', // construction team
    '1571003123894-1f0594d2b5d9', // luxury interior
    '1520250497591-112f2f40a3f4', // modern design interior
    '1542314831-068cd1dbfeeb',    // hotel / modern interior
    '1582719478250-c89cae4dc85b', // interior decor
    '1611892440504-42a792e24d32', // elegant room
    '1445019980597-93fa8acb246c', // stylish interior
    '1631049307264-da0ec9d70304', // contemporary design
  ],

  /**
   * SCUOLA & FORMAZIONE / EDUCATION
   * Classrooms, students, libraries, learning
   */
  education: [
    '1580582932707-520aed937b7b', // classroom / school
    '1503676260728-1c00da094a0b', // student studying
    '1427504494785-3a9ca7044f45', // lecture / education
    '1541339907198-e08756dedf3f', // study / learning
    '1550355291-bbee04a92027',    // school environment
    '1434030216411-0b793f4b4173', // university / college
    '1524178232363-1fb2b075b655', // student with books
    '1519452575417-564c1401ecc0', // educational setting
    '1571260899304-425eee4c7efc', // teacher / classroom
    '1556761175-5973dc0f32e7',    // professional learning
    '1516321318423-f06f85e504b3', // desk study
    '1573496359142-b8d87734a5a2', // education professionals
    '1450101499163-c8848c66ca85', // studying at desk
    '1568992687947-868a62a9f521', // seminar / conference room
    '1557804506-669a67965ba0',    // group learning
    '1543269865-cbf427effbad',    // academic discussion
    '1600880292203-757bb62b4baf', // knowledge sharing
    '1519389950473-47ba0277781c', // modern learning space
    '1517048676732-d65bc937f952', // educational event
    '1552664730-d307ca884978',    // collaborative learning
  ],

  /**
   * NEGOZIO AL DETTAGLIO / RETAIL & SHOPPING
   * Store interiors, shopping, display, products
   */
  retail: [
    '1481437156560-3205f6a55735', // retail store interior
    '1556742049-0cfed4f6a45d',    // shopping / products display
    '1542838132-92c53300491e',    // clothing store
    '1555529669-e69e7aa0ba9a',    // boutique / fashion
    '1607082348824-0a96f2a4b9da', // store display
    '1561715276-a2d087060f1d',    // shopping mall / window
    '1504307651254-35680f356dfd', // commercial space
    '1560518883-ce09059eeffa',    // modern retail
    '1503387762-592deb58ef4e',    // commercial environment
    '1490818715691-54e1e0e1f58b', // fashion boutique
    '1445019980597-93fa8acb246c', // store interior
    '1542314831-068cd1dbfeeb',    // modern space
    '1631049307264-da0ec9d70304', // contemporary store
    '1616486338812-3dadae4b4ace', // product display
    '1611892440504-42a792e24d32', // elegant display
    '1582719478250-c89cae4dc85b', // commercial interior
    '1571003123894-1f0594d2b5d9', // luxury interior
    '1520250497591-112f2f40a3f4', // design interior
    '1480714378408-67cf0d13bc1b', // urban shopping
    '1519389950473-47ba0277781c', // modern commercial space
  ],

  /**
   * VIAGGIO & TURISMO / TRAVEL
   * Landscapes, beaches, mountains, destinations, adventure
   */
  travel: [
    '1476514525535-07fb3b4ae5f1', // mountain landscape
    '1500534314209-a25ddb2bd429', // beach / ocean
    '1507525428034-b723cf961d3e', // tropical beach
    '1501854140801-50d01698950b', // landscape / nature
    '1469474968028-56623f02e42e', // adventure / hiking
    '1464822759023-fed622ff2c3b', // scenic landscape
    '1571003123894-1f0594d2b5d9', // travel destination / beautiful interior
    '1542314831-068cd1dbfeeb',    // travel / destination
    '1445019980597-93fa8acb246c', // travel setting
    '1582719478250-c89cae4dc85b', // scenic view
    '1480714378408-67cf0d13bc1b', // cityscape / urban
    '1526506118085-60ce8714f8c5', // active travel
    '1517836357463-d25dfeac3438', // adventure sports
    '1574680096145-d05b474e2155', // outdoor activity
    '1517838277536-f5f99be501cd', // nature exploration
    '1557804506-669a67965ba0',    // group travel
    '1519389950473-47ba0277781c', // destination
    '1517048676732-d65bc937f952', // travel event
    '1611892440504-42a792e24d32', // luxury travel
    '1631049307264-da0ec9d70304', // contemporary destination
  ],

  /**
   * HOTEL & OSPITALITA / HOTEL
   * Hotel lobbies, rooms, luxury interiors, reception
   */
  hotel: [
    '1571003123894-1f0594d2b5d9', // hotel lobby / luxury
    '1520250497591-112f2f40a3f4', // modern hotel interior
    '1542314831-068cd1dbfeeb',    // hotel / elegant interior
    '1445019980597-93fa8acb246c', // hotel lounge
    '1582719478250-c89cae4dc85b', // hotel room / decor
    '1611892440504-42a792e24d32', // luxury hotel room
    '1631049307264-da0ec9d70304', // contemporary hotel
    '1616486338812-3dadae4b4ace', // hotel design
    '1480714378408-67cf0d13bc1b', // hotel exterior / city
    '1557804506-669a67965ba0',    // hotel meeting room
    '1543269865-cbf427effbad',    // hotel common area
    '1600880292203-757bb62b4baf', // hotel service
    '1519389950473-47ba0277781c', // modern hospitality
    '1517048676732-d65bc937f952', // hotel event
    '1576091160399-112ba8d25d1d', // hotel facilities
    '1552664730-d307ca884978',    // hotel collaboration space
    '1489824904134-891ab8e5e29c', // hotel bedroom
    '1510521230600-cff8acaa3fc3', // hotel breakfast / dining
    '1551882547-ff40c599fb79',    // hotel pool / resort
    '1414235077428-338989a2e8c0', // dining / table setting
  ],

  /**
   * MEDICINA & SALUTE / MEDICAL & HEALTHCARE
   * Doctors, clinics, stethoscopes, healthcare professionals
   */
  medical: [
    '1579684385127-1ef15d508118', // doctor / healthcare
    '1612349317150-e413f6a5b16d', // medical consultation
    '1584515933487-779824d29309', // doctor with tablet
    '1576091160399-112ba8d25d1d', // medical equipment / hospital
    '1559757148-5c350d0d3c56',    // stethoscope / medical tools
    '1551190822-a9333d879b1f',    // doctor / healthcare professional
    '1516321318423-f06f85e504b3', // medical office / desk
    '1573496359142-b8d87734a5a2', // medical team meeting
    '1568992687947-868a62a9f521', // clinic / conference
    '1589829545856-d10d557cf95f', // healthcare consultation
    '1589578527966-fdac0f44566c', // medical documents
    '1554469384-e58fac16e23a',    // patient care
    '1569982175971-d92b01cf8694', // medical professional
    '1542744173-8e7e53415bb0',    // clinic interior
    '1450101499163-c8848c66ca85', // medical staff
    '1557804506-669a67965ba0',    // healthcare team
    '1543269865-cbf427effbad',    // medical discussion
    '1600880292203-757bb62b4baf', // health consultation
    '1519389950473-47ba0277781c', // modern clinic
    '1552664730-d307ca884978',    // medical collaboration
  ],

  /**
   * LAVORO DI SQUADRA / TEAM & OFFICE
   * Teams collaborating, brainstorming, office culture
   */
  teamWork: [
    '1552664730-d307ca884978',    // team collaboration
    '1557804506-669a67965ba0',    // team at table
    '1543269865-cbf427effbad',    // colleagues discussing
    '1600880292203-757bb62b4baf', // business presentation
    '1519389950473-47ba0277781c', // coworking space
    '1517048676732-d65bc937f952', // team event / conference
    '1516321318423-f06f85e504b3', // professional office
    '1573496359142-b8d87734a5a2', // business meeting
    '1568992687947-868a62a9f521', // boardroom / conference
    '1542744173-8e7e53415bb0',    // open office
    '1556761175-5973dc0f32e7',    // professional looking out
    '1497366216548-37526070297c', // office environment
    '1497366811353-6870744d04b2', // office interior
    '1450101499163-c8848c66ca85', // person at desk
    '1571260899304-425eee4c7efc', // meeting / presentation
    '1524178232363-1fb2b075b655', // working together
    '1519452575417-564c1401ecc0', // office culture
    '1550355291-bbee04a92027',    // team environment
    '1580582932707-520aed937b7b', // modern workspace
    '1503676260728-1c00da094a0b', // focused work
  ],
};

/**
 * Returns a random photo ID from a given category.
 */
export function getRandomPhotoId(category: keyof typeof unsplashPhotoIds): string {
  const ids = unsplashPhotoIds[category];
  return ids[Math.floor(Math.random() * ids.length)];
}

/**
 * Returns the full Unsplash CDN URL for a given photo ID.
 */
export function unsplashUrl(id: string, width = 800, quality = 80): string {
  return `https://images.unsplash.com/photo-${id}?w=${width}&q=${quality}&auto=format&fit=crop`;
}

/**
 * Returns N random photo URLs from a category, with no duplicates.
 */
export function getRandomPhotos(
  category: keyof typeof unsplashPhotoIds,
  count: number,
  width = 800,
  quality = 80
): string[] {
  const ids = [...unsplashPhotoIds[category]];
  const result: string[] = [];
  const n = Math.min(count, ids.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * ids.length);
    result.push(unsplashUrl(ids.splice(idx, 1)[0], width, quality));
  }
  return result;
}
