"use strict";
/* -------------------------------------------------------
    NODEJS EXPRESS | MusCo Dev
------------------------------------------------------- */
// sync():

module.exports = async function () {
  //: The following code line is for development purposes only. When it is active the data will not be loaded.
  // return null;

  //: The following code lines are for development purposes only. When it is active the data will be loaded.
  //: This block of code is used to synchronize the database with the initial data.
  //: Since it is produced randomly, the id values should be hexadecimal and 24 characters.

  /* User */
  const User = require("../models/user");
  await User.deleteMany(); //: !!! Clear collection.
  await User.create({
    _id: "1111aaaa2222bbbb3333a001",
    username: "admin",
    password: "MusCo*777",
    email: "admin@site.com",
    firstName: "admin",
    lastName: "admin",
    isActive: true,
    isStaff: true,
    isAdmin: true,
  });
  await User.create({
    _id: "1111aaaa2222bbbb3333a002",
    username: "staff",
    password: "MusCo*777",
    email: "staff@site.com",
    firstName: "staff",
    lastName: "staff",
    isActive: true,
    isStaff: true,
    isAdmin: false,
  });
  await User.create({
    _id: "1111aaaa2222bbbb3333a003",
    username: "user",
    password: "MusCo*777",
    email: "user@site.com",
    firstName: "user",
    lastName: "user",
    isActive: true,
    isStaff: false,
    isAdmin: false,
  });

  /* Brand */
  const Brand = require("../models/brand");
  await Brand.deleteMany();

  /* ----------------------- shoes ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b001",
    name: "Adidas",
    image: "https://logowik.com/content/uploads/images/adidas-new-20225326.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b002",
    name: "Nike",
    image:
      "https://logowik.com/content/uploads/images/nike-swoosh5938.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b003",
    name: "The North Face",
    image: "https://logowik.com/content/uploads/images/the-north-face.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b004",
    name: "Skechers",
    image: "https://logowik.com/content/uploads/images/skechers-shoes8680.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b005",
    name: "Salomon",
    image: "https://logowik.com/content/uploads/images/salomon-group7511.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b006",
    name: "Columbia",
    image:
      "https://logowik.com/content/uploads/images/columbia-sportswear7667.logowik.com.webp",
  });

  /* ----------------------- electronics ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b007",
    name: "Samsung",
    image:
      "https://logowik.com/content/uploads/images/samsung-black-wordmark5578.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b008",
    name: "Xiaomi",
    image: "https://logowik.com/content/uploads/images/621_xiaomi.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b009",
    name: "LG",
    image:
      "https://logowik.com/content/uploads/images/lg-new-20233698.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b034",
    name: "Apple",
    image:
      "https://logowik.com/content/uploads/images/apple-carbon-neutral3283.logowik.com.webp",
  });

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b011",
    name: "Dell",
    image: "https://logowik.com/content/uploads/images/627_dell_logo.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b012",
    name: "Asus",
    image: "https://logowik.com/content/uploads/images/424_asus.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b033",
    name: "Nikon",
    image: "https://logowik.com/content/uploads/images/t_741_nikon.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b134",
    name: "Sony",
    image:
      "https://logowik.com/content/uploads/images/t_sony-makebelieve7224.logowik.com.webp",
  });

  /* ----------------------- clothes ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b013",
    name: "Tommy",
    image: "https://logowik.com/content/uploads/images/375_tommy_hilfiger.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b014",
    name: "Under Armour",
    image: "https://logowik.com/content/uploads/images/under-armour.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b114",
    name: "Jack Wolfskin",
    image:
      "https://logowik.com/content/uploads/images/jack-wolfskin2002.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b015",
    name: "Koton",
    image: "https://logowik.com/content/uploads/images/koton9388.jpg",
  });

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b016",
    name: "Lacoste",
    image:
      "https://logowik.com/content/uploads/images/lacoste-crocodile6472.logowik.com.webp",
  });

  /* ----------------------- home ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b017",
    name: "Braun",
    image: "https://logowik.com/content/uploads/images/t_982_braun.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b018",
    name: "Philips",
    image: "https://logowik.com/content/uploads/images/395_philips.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b019",
    name: "Bosch",
    image:
      "https://logowik.com/content/uploads/images/t_bosch-black8003.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b020",
    name: "Siemens",
    image:
      "https://logowik.com/content/uploads/images/t_siemens-ag7992.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b021",
    name: "Tefal",
    image: "https://logowik.com/content/uploads/images/t_410_tefal.jpg",
  });

  /* ----------------------- beauty ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b022",
    name: "Davidoff",
    image:
      "https://logowik.com/content/uploads/images/davidoff6517.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b023",
    name: "Hugo Boss",
    image: "https://logowik.com/content/uploads/images/t_966_hugoboss.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b024",
    name: "Bvlgari",
    image:
      "https://logowik.com/content/uploads/images/bulgari2696.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b025",
    name: "Nivea",
    image: "https://logowik.com/content/uploads/images/t_239_nivea.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b026",
    name: "Loreal",
    image:
      "https://logowik.com/content/uploads/images/t_loreal2662.logowik.com.webp",
  });

  /* ----------------------- accessories ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b027",
    name: "Fossil",
    image: "https://logowik.com/content/uploads/images/t_fossil-new4401.jpg",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b028",
    name: "Ray-Ban",
    image:
      "https://logowik.com/content/uploads/images/t_ray-ban9478.logowik.com.webp",
  });

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b029",
    name: "Gucci",
    image: "https://logowik.com/content/uploads/images/t_493_gucci.jpg",
  });

  /* ----------------------- Tools ----------------------- */

  await Brand.create({
    _id: "1111aaaa2222bbbb3333b030",
    name: "Stanley",
    image:
      "https://logowik.com/content/uploads/images/stanley-hand-tools2014.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b031",
    name: "Makita",
    image:
      "https://logowik.com/content/uploads/images/t_makita5486.logowik.com.webp",
  });
  await Brand.create({
    _id: "1111aaaa2222bbbb3333b032",
    name: "Metabo",
    image:
      "https://logowik.com/content/uploads/images/t_metabo-no-tagline8054.logowik.com.webp",
  });

  /* Category */
  const Category = require("../models/category");
  await Category.deleteMany();
  await Category.create({
    _id: "1111aaaa2222bbbb3333c001",
    name: "Electronics",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c002",
    name: "Home Appliances",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c003",
    name: "Clothes",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c004",
    name: "Shoes",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c005",
    name: "Beauty",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c006",
    name: "Tools",
  });
  await Category.create({
    _id: "1111aaaa2222bbbb3333c007",
    name: "Accessories",
  });

  /* Firm */
  const Firm = require("../models/firm");
  await Firm.deleteMany();
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f001",
    name: "Boyner",
    phone: "00902124442222",
    image: "https://logowik.com/content/uploads/images/t_242_boyner.jpg",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f002",
    name: "Flo",
    phone: "00902125150019",
    image: "https://logowik.com/content/uploads/images/t_flo7262.jpg",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f003",
    name: "Hepsiburada",
    phone: "00902123330001",
    image: "https://logowik.com/content/uploads/images/t_hepsiburada1183.jpg",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f004",
    name: "Trendyol",
    phone: "00902124447700",
    image:
      "https://logowik.com/content/uploads/images/t_trendyol6623.logowik.com.webp",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f005",
    name: "n11",
    phone: "00902124440011",
    image:
      "https://logowik.com/content/uploads/images/t_n11com-yeni7175.logowik.com.webp",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f006",
    name: "Amazon",
    phone: "0014161234567",
    image: "https://logowik.com/content/uploads/images/t_amazon-black3184.jpg",
    address: "Istanbul - Turkey",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f010",
    name: "Indigo",
    phone: "0014161234567",
    image:
      "https://logowik.com/content/uploads/images/t_indigo5718.logowik.com.webp",
    address: "Toronto - Canada",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f007",
    name: "ZenPlus",
    phone: "0081312345678",
    image: "https://zenstatic.blob.core.windows.net/blog/itxm1epg.ngn",
    address: "Tokyo - Japan",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f008",
    name: "Alibaba Group",
    phone: "008621612345678",
    image: "https://logowik.com/content/uploads/images/t_alibaba-group4891.jpg",
    address: "Shangai - China",
  });
  await Firm.create({
    _id: "1111aaaa2222bbbb3333f009",
    name: "Galeria Kaufhof",
    phone: "00496912345678",
    image:
      "https://logowik.com/content/uploads/images/t_kaufhof5903.logowik.com.webp",
    address: "Duessoldorf - Germany",
  });

  /* Product */
  const Product = require("../models/product");
  await Product.deleteMany();
  await Product.create({
    _id: "e311aaaa2222bbbb3333c001",
    name: "Men's Tommy Jeans Graphic Logo T-Shirt",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b013",
    quantity: 0,
    price: 36.45,
    image:
      "https://m.media-amazon.com/images/I/616f2P4IVUL._AC_UL640_FMwebp_QL65_.jpg",
  });
  await Product.create({
    _id: "e312aaaa2222bbbb3333c001",
    name: "Tommy Jeans T-Shirt",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b013",
    quantity: 0,
    price: 41.45,
    image:
      "https://statics.boyner.com.tr/mnresize/1100/-/productimages/5003174886_600_02.jpg",
  });
  await Product.create({
    _id: "e313aaaa2222bbbb3333c001",
    name: "TNF Belleview Stretch-down Jacket",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b003",
    quantity: 910,
    price: 313.99,
    image:
      "https://www.flo.com.tr/urun/the-north-face-kadin-mont-belleview-stretch-down-jacket-nf0a7uk6hdc1-200776281-1.jpg",
  });
  await Product.create({
    _id: "e314aaaa2222bbbb3333c001",
    name: "Koton Dinosaur Puffer Jacket Quilted Hooded Zippered",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b015",
    quantity: 750,
    price: 14.55,
    image:
      "https://cdn.hepsiglobal.com/prod/media/6962/20240213/1ed16d2f-4734-4e6b-a1cd-bc6af99236eb.jpgk",
  });
  await Product.create({
    _id: "e315aaaa2222bbbb3333c001",
    name: "Jack Wolfskin Fleece Florsbeg Jacket",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b114",
    quantity: 900,
    price: 71.99,
    image:
      "https://www.galeria.de/cf-img-product/1e5a14200ad34d25149e7bc9822709d3/1280",
  });
  await Product.create({
    _id: "e316aaaa2222bbbb3333c001",
    name: "GUCCI Adidas T-shirt in black",
    categoryId: "1111aaaa2222bbbb3333c003",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 165.42,
    image:
      "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0507/users/65b1160b328b6fc7a8f626267a2e278ef44f8a62/i-img1080x1080-1721114430tqwnje481763.jpg",
  });
  await Product.create({
    _id: "e111aaaa2222bbbb3333c001",
    name: "ASUS Gaming PC ROG Zephyrus Duo 16",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b012",
    quantity: 0,
    price: 1521.83,
    image:
      "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0506/users/ef00a959918e8dc5a70a001562fa4f1105ceee89/i-img1000x1000-1719211339rvwavd7.jpg",
  });
  await Product.create({
    _id: "e112aaaa2222bbbb3333c001",
    name: "LG OLED55G3PJA 55-inch 4k OLED TV",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b009",
    quantity: 0,
    price: 1455.67,
    image:
      "https://auctions.c.yimg.jp/images.auctions.yahoo.co.jp/image/dr000/auc0507/users/add600586474c217a38544bbc403d74fdcf9bb02/i-img640x480-17215564484g5ank7.jpg",
  });
  await Product.create({
    _id: "e113aaaa2222bbbb3333c001",
    name: "DELL Inspiron 14 5430 Laptop 14-inch FHD+",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b011",
    quantity: 0,
    price: 561.09,
    image:
      "https://thumbnail.image.rakuten.co.jp/@0_mall/bjy-shop/cabinet/07521593/08554396/111000.jpg",
  });
  await Product.create({
    _id: "e114aaaa2222bbbb3333c001",
    name: "LG 55V OLED LCD TV OLED55B2PJA 55V 4K",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b009",
    quantity: 0,
    price: 858.57,
    image:
      "https://thumbnail.image.rakuten.co.jp/@0_mall/wetradingjapan/cabinet/09357938/oled55b2pja-1.jpg",
  });
  await Product.create({
    _id: "e115aaaa2222bbbb3333c001",
    name: "SAMSUNG Internal SSD 870 EVO [2.5 inch / 500GB]",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b007",
    quantity: 0,
    price: 71.37,
    image:
      "https://thumbnail.image.rakuten.co.jp/@0_mall/r-kojima/cabinet/n0000000323/4560441096681_1.jpg",
  });
  await Product.create({
    _id: "e116aaaa2222bbbb3333c001",
    name: "Xiaomi mi 14 ultra Smartphone Snapdragon 8 Gen 3 HyperOS",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b008",
    quantity: 0,
    price: 1050.0,
    image: "https://sc04.alicdn.com/kf/H8f49433b3eea43d19e1eb97661a08495Z.png",
  });
  await Product.create({
    _id: "e117aaaa2222bbbb3333c001",
    name: "Xiaomi Watch 2 Pro 2GB 32GB 1.43 AMOLED Display",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b008",
    quantity: 0,
    price: 190.0,
    image:
      "https://www.alibaba.com/product-detail/Global-Version-Xiaomi-Watch-2-Pro_1601021011518.html",
  });
  await Product.create({
    _id: "e121aaaa2222bbbb3333c001",
    name: "SAMSUNGS QLED 4K TV 55",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b007",
    quantity: 0,
    price: 680.0,
    image:
      "https://s.alicdn.com/@sc04/kf/Ha4e6641661ac4bb88f4416813c4d014eA.jpg",
  });
  await Product.create({
    _id: "e118aaaa2222bbbb3333c001",
    name: "Nikon D780",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b033",
    quantity: 0,
    price: 3520.0,
    image:
      "https://s.alicdn.com/@sc04/kf/H1f0960873ca645a7a1383db63a1e07edI.jpg",
  });
  await Product.create({
    _id: "e122aaaa2222bbbb3333c001",
    name: "Sony Handycam FDR-AX700 4K",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b134",
    quantity: 0,
    price: 278.0,
    image:
      "https://s.alicdn.com/@sc04/kf/H6654f3b2ffff44fdb348bd55111ff324U.jpg",
  });
  await Product.create({
    _id: "e123aaaa2222bbbb3333c001",
    name: "Dell S2721QS Monitor 27 Inch",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b011",
    quantity: 0,
    price: 264.0,
    image:
      "https://m.media-amazon.com/images/I/81tLVRGg2EL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
  });
  await Product.create({
    _id: "e119aaaa2222bbbb3333c001",
    name: "LG 55-Inch Class UQ7570 Series 4K Smart TV",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b009",
    quantity: 0,
    price: 517.98,
    image: "https://m.media-amazon.com/images/I/A1PAvbwPUxL._AC_SL1500_.jpg",
  });
  await Product.create({
    _id: "e120aaaa2222bbbb3333c001",
    name: "SAMSUNG 75-Inch Class QLED 4K Q60D Series Quantum",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b007",
    quantity: 0,
    price: 1297.99,
    image:
      "https://m.media-amazon.com/images/I/81ScYVlvRPL.__AC_SX300_SY300_QL70_FMwebp_.jpg",
  });
  await Product.create({
    _id: "e124aaaa2222bbbb3333c001",
    name: "Apple Watch Ultra 2 [GPS + Cellular 49mm] Smartwatch",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b034",
    quantity: 0,
    price: 759.37,
    image: "https://m.media-amazon.com/images/I/81zioALMaAL._AC_SL1500_.jpg",
  });
  await Product.create({
    _id: "e125aaaa2222bbbb3333c001",
    name: "Sony DSC-W350 14.1MP Digital Camera with 4x Wide Angle Zoom",
    categoryId: "1111aaaa2222bbbb3333c001",
    brandId: "1111aaaa2222bbbb3333b134",
    quantity: 0,
    price: 215.0,
    image: "https://m.media-amazon.com/images/I/71KiMY8DecL._AC_SL1200_.jpg",
  });
  await Product.create({
    _id: "e211aaaa2222bbbb3333c001",
    name: "Stanley Classic Vacuum Steel Thermos 1.4 lt",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b030",
    quantity: 0,
    price: 86.77,
    image:
      "https://cdn.hepsiglobal.com/prod/media/19551/20240516/aa3559a0-5bb4-4dbd-8ebe-cf42bba0fa1a.jpg",
  });
  await Product.create({
    _id: "e212aaaa2222bbbb3333c001",
    name: "Tefal Xxl 6.5 Lt Air Frying and Grilling 2 in 1 Oil-Free Deep Fryer",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 494.93,
    image:
      "https://cdn.hepsiglobal.com/prod/media/16874/20240430/ef24a046-38d0-4176-8692-d7cac4afbcf3.jpg",
  });
  await Product.create({
    _id: "e213aaaa2222bbbb3333c001",
    name: "Tefal KI730D30 1.7 L Capacity Glass Kettle",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 223.22,
    image:
      "https://cdn.hepsiglobal.com/prod/media/22361/20240624/8a3e0bdc-b675-4d42-b833-2c39a0d6df2b.jpg",
  });
  await Product.create({
    _id: "e214aaaa2222bbbb3333c001",
    name: "Tefal Pro Express GV9221 2600W Boiler Iron",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 535.42,
    image:
      "https://cdn.hepsiglobal.com/prod/media/12221/20240312/1ddc7a3a-f9bf-4aae-9e6b-47850dc4aada.jpg",
  });
  await Product.create({
    _id: "e215aaaa2222bbbb3333c001",
    name: "Tefal BJ201F MyTea Tea Maker White",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 124.18,
    image:
      "https://cdn.hepsiglobal.com/prod/media/2424/20220509/b81aaf31-be9d-4278-86a8-7709ef2e4d29.jpg",
  });
  await Product.create({
    _id: "e216aaaa2222bbbb3333c001",
    name: "Tefal Glass Blender Set",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 477.69,
    image:
      "https://cdn.hepsiglobal.com/prod/media/16874/20240504/bd08489b-8f06-420a-b01a-bf026a8bd62d.jpg",
  });
  await Product.create({
    _id: "e217aaaa2222bbbb3333c001",
    name: "Tefal UW3719 Compact Power Cyclonic Dust Bagless Vacuum Cleaner",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b021",
    quantity: 0,
    price: 175.21,
    image:
      "https://cdn.hepsiglobal.com/prod/media/2749/20220521/e5a57d02-a7de-4f59-8b9c-0f679775413b.jpg",
  });
  await Product.create({
    _id: "e218aaaa2222bbbb3333c001",
    name: "Braun WK5115BK ID Collection Kettle",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b017",
    quantity: 0,
    price: 488.85,
    image:
      "https://cdn.hepsiglobal.com/prod/media/22361/20240624/87e046fe-9d8f-4afc-ab5a-16ecf219923f.jpg",
  });
  await Product.create({
    _id: "e219aaaa2222bbbb3333c001",
    name: "Braun KF5120BK Id Collection Filter Coffee Machine",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b017",
    quantity: 0,
    price: 435.98,
    image:
      "https://cdn.hepsiglobal.com/prod/media/16722/20240503/b25870b5-8ae3-47ea-930e-ad8a41b638ab.jpg",
  });
  await Product.create({
    _id: "e220aaaa2222bbbb3333c001",
    name: "Bosch Washing machine WUU28T22",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b019",
    quantity: 0,
    price: 749.0,
    image:
      "https://www.galeria.de/cf-img-product/158a271d83371c04f34e326248d5add1/1280",
  });
  await Product.create({
    _id: "e221aaaa2222bbbb3333c001",
    name: "Bosch French door fridge-freezer combination KFN 96VPEA NoFrost",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b019",
    quantity: 0,
    price: 1649.0,
    image:
      "https://www.galeria.de/cf-img-product/e469075a9b78c3c8fc99e8866b9bc81c/1280",
  });
  await Product.create({
    _id: "e222aaaa2222bbbb3333c001",
    name: "Bosch Dishwasher SMS 6TCI00E",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b019",
    quantity: 0,
    price: 999.0,
    image:
      "https://www.galeria.de/cf-img-product/caa489b2173cac6cbf53d10101ea64bc/1280",
  });
  await Product.create({
    _id: "e223aaaa2222bbbb3333c001",
    name: "Bosch Freestanding stove HKR 39C250",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b019",
    quantity: 0,
    price: 849.0,
    image:
      "https://www.galeria.de/cf-img-product/f0c00e58cb9f29d5f717fdd0e92a8f8a/1280",
  });
  await Product.create({
    _id: "e224aaaa2222bbbb3333c001",
    name: "Siemens Undercounter dishwasher SN 43ES14CE, iQdrive motor",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b020",
    quantity: 0,
    price: 749.0,
    image:
      "https://www.galeria.de/cf-img-product/b4ffa8ef1e60295b03aa89b3e9b5fccf/1280",
  });
  await Product.create({
    _id: "e225aaaa2222bbbb3333c001",
    name: "Siemens Fully automatic coffee machine EQ.500 TQ505D09 with milk frothing container",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b020",
    quantity: 0,
    price: 849.0,
    image:
      "https://www.galeria.de/cf-img-product/7ac906cf0ff9af474a71ad6d3775ab31/1280",
  });
  await Product.create({
    _id: "e226aaaa2222bbbb3333c001",
    name: "Siemens Canister vacuum cleaner Synchropower VS06A111 powerSecure System",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b020",
    quantity: 0,
    price: 99.0,
    image:
      "https://www.galeria.de/cf-img-product/3b3a97cfb079abc13c995c0f2c1993ce/1280",
  });
  await Product.create({
    _id: "e227aaaa2222bbbb3333c001",
    name: "Siemens Built-in oven set EQ 211KB00",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b020",
    quantity: 0,
    price: 799.0,
    image:
      "https://www.galeria.de/cf-img-product/b88e28fb99f67e2f701c608e772ccefc/1280",
  });
  await Product.create({
    _id: "e228aaaa2222bbbb3333c001",
    name: "Braun Digital Radio Alarm Clock",
    categoryId: "1111aaaa2222bbbb3333c002",
    brandId: "1111aaaa2222bbbb3333b017",
    quantity: 0,
    price: 799.0,
    image:
      "https://www.galeria.de/cf-img-product/a981c24543b4284beb6c759e16058754/2560",
  });
  await Product.create({
    _id: "e411aaaa2222bbbb3333c001",
    name: "Trendyol Nike Blazer Mid Pro Club Sneakers",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 120.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1029/product/media/images/prod/SPM/PIM/20231102/20/395b6bec-f236-3b2f-903f-601bb22dd3d5/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e412aaaa2222bbbb3333c001",
    name: "Trendyol Nike Air Max Sc Sneakers",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 124.99,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty851/product/media/images/20230427/15/333364985/920716479/1/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e413aaaa2222bbbb3333c001",
    name: "Trendyol Nike White Flat Heel Sneakers",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 74.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1354/product/media/images/prod/QC/20240608/02/e56af19a-8751-34f2-97bf-abc0f4857bf8/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e439aaaa2222bbbb3333c001",
    name: "Trendyol Nike Air Jordan",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 220.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1311/product/media/images/prod/PIM/20240515/06/e59a4f1f-7c3b-4cb0-887f-f86e5b73cb93/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e414aaaa2222bbbb3333c001",
    name: "Trendyol Nike Air Jordan",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 220.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1311/product/media/images/prod/PIM/20240515/06/e59a4f1f-7c3b-4cb0-887f-f86e5b73cb93/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e415aaaa2222bbbb3333c001",
    name: "Trendyol Adidas Casual Sneakers",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 120.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1430/product/media/images/prod/QC/20240718/19/083c2ae0-5f03-3b8e-90c1-e25f26cae2aa/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e416aaaa2222bbbb3333c001",
    name: "Trendyol Adidas Grand Court TDad",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 65.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty1435/product/media/images/prod/QC/20240529/03/4d8a0a7f-938a-3239-b223-48302ed66477/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e417aaaa2222bbbb3333c001",
    name: "Trendyol Adidas Flat Heel2",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 125.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/400/-/ty18/product/media/images/20201028/18/20162880/98507771/1/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e418aaaa2222bbbb3333c001",
    name: "Trendyol Skechers Loafer Flacher Absatz",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b004",
    quantity: 0,
    price: 119.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/100/-/ty849/product/media/images/20230427/18/333437274/920828798/1/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e419aaaa2222bbbb3333c001",
    name: "Trendyol Skechers Track New Staple",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b004",
    quantity: 0,
    price: 51.95,
    image:
      "https://cdn.dsmcdn.com//ty1436/product/media/images/prod/QC/20240529/14/e0d49ed9-4079-38d1-ae12-ed17c6f64633/1_org.jpg",
  });
  await Product.create({
    _id: "e420aaaa2222bbbb3333c001",
    name: "Trendyol Skechers Summits",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b004",
    quantity: 0,
    price: 83.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1432/product/media/images/prod/QC/20240530/04/028198f9-c234-398c-86a1-0ee78be67137/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e421aaaa2222bbbb3333c001",
    name: "Trendyol Skechers 12615 WTRG Sneaker",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b004",
    quantity: 0,
    price: 112.45,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1393/product/media/images/prod/QC/20240701/20/b87b0fe7-cc83-39db-955e-2494b7e086a0/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e422aaaa2222bbbb3333c001",
    name: "Trendyol The North Face M Vevtic Levitum Navy",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b003",
    quantity: 0,
    price: 119.45,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1210/product/media/images/prod/SPM/PIM/20240315/01/038a69ce-af39-3045-a9ac-cd3c5834c0ed/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e423aaaa2222bbbb3333c001",
    name: "Trendyol The North Face M Hedgehog Fastpack",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b003",
    quantity: 0,
    price: 129.99,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty345/product/media/images/20220301/14/60628820/400370324/2/2_org_zoom.jpg",
  });

  await Product.create({
    _id: "e424aaaa2222bbbb3333c001",
    name: "Trendyol The North Face M Explore Camp Sandal",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b003",
    quantity: 0,
    price: 109.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1267/product/media/images/prod/SPM/PIM/20240420/12/8fe6286b-dd74-3a54-b777-82b480acad3e/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e425aaaa2222bbbb3333c001",
    name: "Trendyol The North Face M Vectic Levitum Futurelight",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b003",
    quantity: 0,
    price: 109.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1147/product/media/images/prod/SPM/PIM/20240126/14/bc0c14d9-c40c-326d-8c42-7901b268ad02/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e426aaaa2222bbbb3333c001",
    name: "Trendyol Salomon X Ultra 360 Outdoor",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b005",
    quantity: 0,
    price: 145.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1411/product/media/images/prod/QC/20240709/17/aa0c4208-b39b-3ba5-bd05-3ac7bb3fbddb/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e427aaaa2222bbbb3333c001",
    name: "Trendyol Salomon Techamphibian 5 W Outdoor",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b005",
    quantity: 0,
    price: 155.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1021/product/media/images/prod/SPM/PIM/20231023/15/3daa043b-7636-3920-8840-96563ded3784/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e428aaaa2222bbbb3333c001",
    name: "Trendyol Salomon Sense Ride 5",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b005",
    quantity: 0,
    price: 135.95,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1183/product/media/images/prod/SPM/PIM/20240227/15/d3aba15c-d8a6-3aeb-bf2c-80b9ba9c7061/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e429aaaa2222bbbb3333c001",
    name: "Trendyol Salomon Supercross",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b005",
    quantity: 0,
    price: 180.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1414/product/media/images/prod/QC/20240604/15/898a8975-c0ac-3e9d-b8c0-e10288aa2a03/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e430aaaa2222bbbb3333c001",
    name: "Trendyol Salomon Outblast Ts Cs Boot Outdoor",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b005",
    quantity: 0,
    price: 140.0,
    image:
      "https://cdn.dsmcdn.com/mnresize/128/192/ty1024/product/media/images/prod/SPM/PIM/20231025/13/3fe0c985-4306-379f-8039-ee2848c0689f/1_org_zoom.jpg",
  });
  await Product.create({
    _id: "e431aaaa2222bbbb3333c001",
    name: "n11 Columbia Ym1337 Flow Fremont",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b006",
    quantity: 0,
    price: 140.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/13/38/52/31/IMG-3189979845551988389.jpg",
  });
  await Product.create({
    _id: "e432aaaa2222bbbb3333c001",
    name: "n11 Columbia Bm5879 Castback",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b006",
    quantity: 0,
    price: 183.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/16/92/17/53/IMG-4939149979213734211.jpg",
  });
  await Product.create({
    _id: "e433aaaa2222bbbb3333c001",
    name: "n11 Columbia Bm7444 Hatana Breathe Nori",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b006",
    quantity: 0,
    price: 183.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/10/62/04/61/IMG-2251466742473578793.jpg",
  });
  await Product.create({
    _id: "e434aaaa2222bbbb3333c001",
    name: "n11 Adidas Ultrabounce",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 65.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/07/34/34/14/IMG-4724214806691599833.jpg",
  });
  await Product.create({
    _id: "e435aaaa2222bbbb3333c001",
    name: "n11 Adidas Run 80s",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 61.0,
    image:
      "https://n11scdn.akamaized.net/a1/602_857/14/39/28/87/IMG-3654302815708852780.jpg",
  });
  await Product.create({
    _id: "e436aaaa2222bbbb3333c001",
    name: "n11 Adidas Terrex Hydroterra",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 91.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/14/45/89/94/IMG-2144290850181967230.jpg",
  });
  await Product.create({
    _id: "e437aaaa2222bbbb3333c001",
    name: "Flo Nike Legend 10 Club FG MG",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b002",
    quantity: 0,
    price: 49.99,
    image:
      "https://floimages.mncdn.com/media/catalog/product/23-07/17/101792329_d1-1689578638.jpeg",
  });
  await Product.create({
    _id: "e438aaaa2222bbbb3333c001",
    name: "Flo Adidas Duramo SL Neon",
    categoryId: "1111aaaa2222bbbb3333c004",
    brandId: "1111aaaa2222bbbb3333b001",
    quantity: 0,
    price: 48.99,
    image:
      "https://flo-comment-images.mncdn.com/1/1223503/8d5c68d632ff61898088115e368698e0.jpeg",
  });

  await Product.create({
    _id: "e511aaaa2222bbbb3333c001",
    name: "n11 Davidoff Cool EDT 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b022",
    quantity: 0,
    price: 25.0,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/10/09/88/83/IMG-349960245827411936.jpg",
  });
  await Product.create({
    _id: "e512aaaa2222bbbb3333c001",
    name: "n11 Davidoff Cool Water EDT 125 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b022",
    quantity: 0,
    price: 29.9,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/13/06/93/84/IMG-599184418437775581.jpg",
  });
  await Product.create({
    _id: "e513aaaa2222bbbb3333c001",
    name: "n11 Hugo Boss In Motion EDT 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b023",
    quantity: 0,
    price: 71.9,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/03/96/94/44/IMG-8964246961541643443.jpg",
  });
  await Product.create({
    _id: "e514aaaa2222bbbb3333c001",
    name: "n11 Hugo Boss Number One EDT 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b023",
    quantity: 0,
    price: 71.9,
    image:
      "https://n11scdn1.akamaized.net/a1/60_86/16/77/03/70/IMG-441863178759793215.jpg",
  });

  await Product.create({
    _id: "e515aaaa2222bbbb3333c001",
    name: "n11 Bvlgari Omnia Crystalline EDT 50 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b024",
    quantity: 0,
    price: 99.9,
    image:
      "https://n11scdn.akamaized.net/a1/226_339/11/73/58/83/IMG-8464841488020322916.jpg",
  });
  await Product.create({
    _id: "e516aaaa2222bbbb3333c001",
    name: "n11 Bvlgari Man In Black 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b024",
    quantity: 0,
    price: 74.9,
    image:
      "https://n11scdn.akamaized.net/a1/226_339/08/27/82/57/IMG-6160203873472330441.jpg",
  });

  await Product.create({
    _id: "e517aaaa2222bbbb3333c001",
    name: "n11 Bvlgari Splendida Tubereuse Mystique 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b024",
    quantity: 0,
    price: 119.9,
    image:
      "https://n11scdn.akamaized.net/a1/602_857/09/58/47/03/IMG-5766510902759694799.jpg",
  });
  await Product.create({
    _id: "e518aaaa2222bbbb3333c001",
    name: "n11 Bvlgari Aqva 50 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b024",
    quantity: 0,
    price: 89.9,
    image:
      "https://n11scdn.akamaized.net/a1/602_857/13/56/68/72/IMG-1978005322796163237.jpg",
  });
  await Product.create({
    _id: "e519aaaa2222bbbb3333c001",
    name: "Boyner Loreal Paris Revitalift Laser Anti-Spot 50 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b026",
    quantity: 0,
    price: 21.9,
    image:
      "https://statics.boyner.com.tr/mnresize/1100/-/productimages/3600523456253_0.jpg",
  });
  await Product.create({
    _id: "e520aaaa2222bbbb3333c001",
    name: "Boyner Loreal Paris Color Riche Satin Finish Lipstick Paris Pink",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b026",
    quantity: 0,
    price: 24.9,
    image:
      "https://statics.boyner.com.tr/mnresize/300/-/productimages/5002711521_650_01.jpg",
  });
  await Product.create({
    _id: "e521aaaa2222bbbb3333c001",
    name: "Amazon Loreal Paris Makeup True Match",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b026",
    quantity: 0,
    price: 5.9,
    image: "https://m.media-amazon.com/images/I/71ev7DV+r1S._SL1500_.jpg",
  });
  await Product.create({
    _id: "e522aaaa2222bbbb3333c001",
    name: "Amazon Loreal Paris Men Expert Face Scrub",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b026",
    quantity: 0,
    price: 131.0,
    image: "https://m.media-amazon.com/images/I/71bWSmCtkqL._SL1500_.jpg",
  });
  await Product.create({
    _id: "e523aaaa2222bbbb3333c001",
    name: "Amazon Loreal Paris Metal Detox Shampoo",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b026",
    quantity: 0,
    price: 86.0,
    image: "https://m.media-amazon.com/images/I/61CROu7UYZL._SL1500_.jpg",
  });
  await Product.create({
    _id: "e524aaaa2222bbbb3333c001",
    name: "Amazon Nivea Shower Oil Natural Caring 200 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b025",
    quantity: 0,
    price: 13.99,
    image: "https://m.media-amazon.com/images/I/515+ODFHbbL._SL1003_.jpg",
  });
  await Product.create({
    _id: "e525aaaa2222bbbb3333c001",
    name: "Amazon Nivea  Shea Nourish Body Lotion",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b025",
    quantity: 0,
    price: 15.99,
    image: "https://m.media-amazon.com/images/I/61EBYfuVD1L._SL1500_.jpg",
  });
  await Product.create({
    _id: "e526aaaa2222bbbb3333c001",
    name: "Amazon Nivea Urban Skin Detox Micellar Water",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b025",
    quantity: 0,
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/61S71tMF9PL._SL1180_.jpg",
  });
  await Product.create({
    _id: "e527aaaa2222bbbb3333c001",
    name: "Amazon Davidoff Adventure EDT 100 ml",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b022",
    quantity: 0,
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/61MjW+6YsBL._SL1500_.jpg",
  });
  await Product.create({
    _id: "e528aaaa2222bbbb3333c001",
    name: "Amazon Braun Electric Series 3 Razor with Precision Trimmer",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b017",
    quantity: 0,
    price: 99.94,
    image: "https://m.media-amazon.com/images/I/714pdqMdFKL._SL1500_.jpg",
  });
  await Product.create({
    _id: "e529aaaa2222bbbb3333c001",
    name: "Amazon Braun Epilator Silk-épil",
    categoryId: "1111aaaa2222bbbb3333c005",
    brandId: "1111aaaa2222bbbb3333b017",
    quantity: 0,
    price: 99.94,
    image: "https://m.media-amazon.com/images/I/61svV-udTXL._SL1000_.jpg",
  });
  await Product.create({
    _id: "e611aaaa2222bbbb3333c001",
    name: "Amazon Makita XDT11Z 18V LXT Lithium-Ion Cordless Impact Driver Tool Only",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b031",
    quantity: 0,
    price: 84.94,
    image:
      "https://m.media-amazon.com/images/I/61-e3WcAnhL._AC_UL640_FMwebp_QL65_.jpg",
  });
  await Product.create({
    _id: "e612aaaa2222bbbb3333c001",
    name: "Amazon Makita DML815 18V LXT® Lithium-Ion Cordless L.E.D. Flashlight",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b031",
    quantity: 0,
    price: 29.94,
    image:
      "https://m.media-amazon.com/images/I/51rPIs4FyjL._AC_UL640_FMwebp_QL65_.jpg",
  });
  await Product.create({
    _id: "e613aaaa2222bbbb3333c001",
    name: "Amazon Makita XCU06Z 18V LXT® Lithium-Ion Brushless Cordless 10 Inch Top Handle Chain Saw, Tool Only",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b031",
    quantity: 0,
    price: 194.94,
    image: "https://m.media-amazon.com/images/I/61eqDjCN5wL._AC_SL1500_.jpg",
  });
  await Product.create({
    _id: "e614aaaa2222bbbb3333c001",
    name: "Amazon Metabo 5 Inch Variable Speed Angle Grinder2, 800-9, 600 Rpm - 13.5 Amp W/Electronics, High Torque, Lock-On ",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b032",
    quantity: 0,
    price: 129.99,
    image:
      "https://m.media-amazon.com/images/I/814AyFMaRdL._AC_UL640_FMwebp_QL65_.jpg",
  });
  await Product.create({
    _id: "e618aaaa2222bbbb3333c001",
    name: "Amazon Metabo HPT Impact Driver Bit Set (60-pieces)",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b032",
    quantity: 0,
    price: 29.99,
    image: "https://m.media-amazon.com/images/I/51kKkx8ShrL._AC_SL1000_.jpg",
  });
  await Product.create({
    _id: "e619aaaa2222bbbb3333c001",
    name: "Amazon Metabo HPT WR18DBDL2Q4M 18V Brushless Lithium-Ion 1/2 in. Cordless Triple Hammer Impact Wrench (Tool Only)",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b032",
    quantity: 0,
    price: 109.97,
    image: "https://m.media-amazon.com/images/I/61GbCIDwUWS._AC_SL1000_.jpg",
  });
  await Product.create({
    _id: "e615aaaa2222bbbb3333c001",
    name: "Amazon Stanley FatMax 40-Foot Tape Rule",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b030",
    quantity: 0,
    price: 34.99,
    image: "https://m.media-amazon.com/images/I/61OpxF6snuL._SL1000_.jpg",
  });
  await Product.create({
    _id: "e616aaaa2222bbbb3333c001",
    name: "Amazon Stanley 0-42-130 Pocket Level Magnetic Horizontal-Vertical Yellow",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b030",
    quantity: 0,
    price: 14.99,
    image: "https://m.media-amazon.com/images/I/61QOpnW8-LL._AC_SL1500_.jpg",
  });
  await Product.create({
    _id: "e617aaaa2222bbbb3333c001",
    name: "Amazon Stanley Home Mechanics 65 Piece Black",
    categoryId: "1111aaaa2222bbbb3333c006",
    brandId: "1111aaaa2222bbbb3333b030",
    quantity: 0,
    price: 54.27,
    image: "https://m.media-amazon.com/images/I/71mNqdOYN2L._AC_SL1500_.jpg",
  });
  await Product.create({
    _id: "e711aaaa2222bbbb3333c001",
    name: "Amazon Fossil Male Sunglass Style Fos 3100S Rectangular",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b027",
    quantity: 0,
    price: 34.75,
    image: "https://m.media-amazon.com/images/I/61w0L9cW-ZL._AC_SX679_.jpg",
  });
  await Product.create({
    _id: "e712aaaa2222bbbb3333c001",
    name: "Amazon Fossil Grant Men's Watch with Chronograph or Automatic Display and Genuine Leather or Stainless Steel Band",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b027",
    quantity: 0,
    price: 190.0,
    image: "https://m.media-amazon.com/images/I/71Z5n0DTigL._AC_SX679_.jpg",
  });
  await Product.create({
    _id: "e713aaaa2222bbbb3333c001",
    name: "Amazon Ray-Ban Men's RB3483 Metal Square Sunglasses",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b028",
    quantity: 0,
    price: 99.0,
    image: "https://m.media-amazon.com/images/I/41198LLwgPL._AC_SX679_.jpg",
  });
  await Product.create({
    _id: "e714aaaa2222bbbb3333c001",
    name: "Amazon Ray-Ban RB3016 Clubmaster Square Sunglasses",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b028",
    quantity: 0,
    price: 124.6,
    image: "https://m.media-amazon.com/images/I/510ttxv+vML._AC_SX679_.jpg",
  });
  await Product.create({
    _id: "e715aaaa2222bbbb3333c001",
    name: "Amazon Ray-Ban RB2132 New Wayfarer Mirrored Square Sunglasses",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b028",
    quantity: 0,
    price: 154.6,
    image: "https://m.media-amazon.com/images/I/51-gKMkDVXL._AC_SX679_.jpg",
  });
  await Product.create({
    _id: "e716aaaa2222bbbb3333c001",
    name: "Amazon Gucci Geometric Sunglasses GG0956S",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b029",
    quantity: 0,
    price: 262.82,
    image: "https://m.media-amazon.com/images/I/61qw2vVbOeL._AC_SX695_.jpg",
  });
  await Product.create({
    _id: "e717aaaa2222bbbb3333c001",
    name: "Amazon Gucci Soho Interlocking GG Red Leather Chain Flap Shoulder Bag Handbag Italy New",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b029",
    quantity: 0,
    price: 2150.0,
    image: "https://m.media-amazon.com/images/I/71SL5Y0IaYL._AC_SY695_.jpg",
  });
  await Product.create({
    _id: "e718aaaa2222bbbb3333c001",
    name: "Amazon Gucci SYNC L Stainless Steel Watch with Rubber Band",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b029",
    quantity: 0,
    price: 350.0,
    image: "https://m.media-amazon.com/images/I/81u1PH8XDEL._AC_SY879_.jpg",
  });
  await Product.create({
    _id: "e719aaaa2222bbbb3333c001",
    name: "Amazon Gucci Women's Leather Belt with Buckle",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b029",
    quantity: 0,
    price: 19.99,
    image:
      "https://m.media-amazon.com/images/I/61-4Bj8wLFL._AC_UL640_FMwebp_QL65_.jpg",
  });
  await Product.create({
    _id: "e720aaaa2222bbbb3333c001",
    name: "Amazon Gucci Stainless Steel Watch with Leather Bomen's Band",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b029",
    quantity: 0,
    price: 585.0,
    image: "https://m.media-amazon.com/images/I/81eTM4WVTEL._AC_SY879_.jpg",
  });
  await Product.create({
    _id: "e721aaaa2222bbbb3333c001",
    name: "Amazon Fossil Men's Stainless Steel or Leather Necklace for Men",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b027",
    quantity: 0,
    price: 65.0,
    image: "https://m.media-amazon.com/images/I/51zpIp+wlWL._AC_SY695_.jpg",
  });
  await Product.create({
    _id: "e722aaaa2222bbbb3333c001",
    name: "Amazon Fossil Daisy Women's Watch with Stainless Steel Bracelet or Genuine Leather Band",
    categoryId: "1111aaaa2222bbbb3333c007",
    brandId: "1111aaaa2222bbbb3333b027",
    quantity: 0,
    price: 130.0,
    image: "https://m.media-amazon.com/images/I/61Ai7h3XXAL._AC_SY879_.jpg",
  });

  /* Purchase */
  const Purchase = require("../models/purchase");
  await Purchase.deleteMany();
  await Purchase.create({
    _id: "a111aaaa2222bbbb3333a111",
    userId: "1111aaaa2222bbbb3333a001",
    firmId: "1111aaaa2222bbbb3333f003",
    brandId: "1111aaaa2222bbbb3333b027",
    productId: "e722aaaa2222bbbb3333c001",
    quantity: 1000,
    price: 20,
  });
  await Purchase.create({
    _id: "a111aaaa2222bbbb3333a112",
    userId: "1111aaaa2222bbbb3333a001",
    firmId: "1111aaaa2222bbbb3333f003",
    brandId: "1111aaaa2222bbbb3333b030",
    productId: "e617aaaa2222bbbb3333c001",
    quantity: 1000,
    price: 30,
  });
  await Purchase.create({
    _id: "a111aaaa2222bbbb3333a113",
    userId: "1111aaaa2222bbbb3333a002",
    firmId: "1111aaaa2222bbbb3333f003",
    brandId: "1111aaaa2222bbbb3333b031",
    productId: "e613aaaa2222bbbb3333c001",
    quantity: 1000,
    price: 5,
  });
  await Purchase.create({
    _id: "a111aaaa2222bbbb3333a114",
    userId: "1111aaaa2222bbbb3333a002",
    firmId: "1111aaaa2222bbbb3333f007",
    brandId: "1111aaaa2222bbbb3333b024",
    productId: "e518aaaa2222bbbb3333c001",
    quantity: 10,
    price: 100,
  });
  await Purchase.create({
    _id: "a111aaaa2222bbbb3333a115",
    userId: "1111aaaa2222bbbb3333a002",
    firmId: "1111aaaa2222bbbb3333f004",
    brandId: "1111aaaa2222bbbb3333b022",
    productId: "e527aaaa2222bbbb3333c001",
    quantity: 10,
    price: 75,
  });

  /* Sell */
  const Sell = require("../models/sell");
  await Sell.deleteMany();
  await Sell.create({
    _id: "b111aaaa2222bbbb3333a111",
    userId: "1111aaaa2222bbbb3333a001",
    brandId: "1111aaaa2222bbbb3333b027",
    productId: "e722aaaa2222bbbb3333c001",
    quantity: 100,
    price: 30,
  });
  await Sell.create({
    _id: "b111aaaa2222bbbb3333a112",
    userId: "1111aaaa2222bbbb3333a001",
    brandId: "1111aaaa2222bbbb3333b030",
    productId: "e617aaaa2222bbbb3333c001",
    quantity: 250,
    price: 40,
  });
  await Sell.create({
    _id: "b111aaaa2222bbbb3333a113",
    userId: "1111aaaa2222bbbb3333a001",
    brandId: "1111aaaa2222bbbb3333b031",
    productId: "e613aaaa2222bbbb3333c001",
    quantity: 100,
    price: 6,
  });
  await Sell.create({
    _id: "b111aaaa2222bbbb3333a114",
    userId: "1111aaaa2222bbbb3333a002",
    brandId: "1111aaaa2222bbbb3333b024",
    productId: "e518aaaa2222bbbb3333c001",
    quantity: 10,
    price: 3500,
  });
  await Sell.create({
    _id: "b111aaaa2222bbbb3333a115",
    userId: "1111aaaa2222bbbb3333a002",
    brandId: "1111aaaa2222bbbb3333b022",
    productId: "e527aaaa2222bbbb3333c001",
    quantity: 10,
    price: 3500,
  });

  /* Finished */
  console.log("* Synchronized.");
};
