/**
 * Product image utility for Olist Brazilian E-Commerce categories.
 * Uses deterministic hashing on product_id to select consistent images.
 */

const CATEGORY_IMAGES: Record<string, string[]> = {
  informatica_acessorios: [
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=400&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&q=80",
  ],
  moveis_decoracao: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&q=80",
  ],
  beleza_saude: [
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80",
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
  ],
  cama_mesa_banho: [
    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&q=80",
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&q=80",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
  ],
  telefonia: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80",
    "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&q=80",
    "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
  ],
  esporte_lazer: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80",
    "https://images.unsplash.com/photo-1461896836934-bd45ea8b2413?w=400&q=80",
    "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=400&q=80",
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&q=80",
  ],
  ferramentas_jardim: [
    "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80",
    "https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?w=400&q=80",
  ],
  perfumaria: [
    "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80",
    "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&q=80",
    "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80",
  ],
  bebes: [
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80",
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400&q=80",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80",
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400&q=80",
  ],
  relogios_presentes: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80",
    "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=400&q=80",
    "https://images.unsplash.com/photo-1549972574-8e3e1e6e6592?w=400&q=80",
  ],
  utilidades_domesticas: [
    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=400&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    "https://images.unsplash.com/photo-1583845112239-97ef1341b271?w=400&q=80",
    "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400&q=80",
  ],
  eletronicos: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&q=80",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400&q=80",
    "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=400&q=80",
  ],
  papelaria: [
    "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400&q=80",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&q=80",
    "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400&q=80",
  ],
  fashion_bolsas_e_acessorios: [
    "https://images.unsplash.com/photo-1445205170230-053b830c6050?w=400&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
  ],
  automotivo: [
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&q=80",
    "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&q=80",
  ],
  brinquedos: [
    "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400&q=80",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&q=80",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80",
  ],
  alimentos_bebidas: [
    "https://images.unsplash.com/photo-1506617420156-8e4536971650?w=400&q=80",
    "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&q=80",
    "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
  ],
  cool_stuff: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
  ],
  climatizacao: [
    "https://images.unsplash.com/photo-1631541490210-441460a33190?w=400&q=80",
    "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=400&q=80",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80",
  ],
  pet_shop: [
    "https://images.unsplash.com/photo-1450778869180-e77d3f97e01e?w=400&q=80",
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80",
  ],
  moveis_escritorio: [
    "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&q=80",
    "https://images.unsplash.com/photo-1486946255434-2466348c2166?w=400&q=80",
  ],
  construcao_ferramentas_ferramentas: [
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&q=80",
    "https://images.unsplash.com/photo-1530124566582-a45a7e3abe72?w=400&q=80",
    "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=80",
    "https://images.unsplash.com/photo-1581165825571-a6377084e766?w=400&q=80",
  ],
  livros_interesse_geral: [
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80",
    "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=400&q=80",
    "https://images.unsplash.com/photo-1519682577862-22b62b24e493?w=400&q=80",
  ],
  musica: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&q=80",
    "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=80",
    "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400&q=80",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&q=80",
  ],
  eletrodomesticos: [
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&q=80",
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=400&q=80",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400&q=80",
  ],
  tablets_impressao_imagem: [
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80",
    "https://images.unsplash.com/photo-1561154464-82e9aab32f4d?w=400&q=80",
    "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&q=80",
  ],
  consoles_games: [
    "https://images.unsplash.com/photo-1486401899868-0e435ed85128?w=400&q=80",
    "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80",
    "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&q=80",
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&q=80",
  ],
  audio: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80",
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&q=80",
  ],
  flores: [
    "https://images.unsplash.com/photo-1490750967868-88aa4f44bacd?w=400&q=80",
    "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&q=80",
    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=400&q=80",
  ],
  artes: [
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80",
    "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&q=80",
  ],
  industria_comercio_e_negocios: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=80",
  ],
  malas_acessorios: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&q=80",
    "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=400&q=80",
    "https://images.unsplash.com/photo-1575844264771-892081089af5?w=400&q=80",
  ],
  agro_industria_e_comercio: [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&q=80",
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&q=80",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80",
  ],
  _default: [
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80",
    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&q=80",
  ],
};

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProductImage(productId: string, category: string): string {
  const images = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["_default"]!;
  const index = hashCode(productId) % images.length;
  return images[index]!;
}

export function getCategoryImage(category: string): string {
  const images = CATEGORY_IMAGES[category] ?? CATEGORY_IMAGES["_default"]!;
  return images[0]!;
}

export function formatCategory(category: string): string {
  return category
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
