// Meal templates — coherent Indian meal combinations
// Each template references foods from foodDatabase by ID with gram portions
// Nutrition is calculated dynamically by the nutrition engine (never hardcoded here)

export const mealTemplates = [
  // ═══════════════════════════════════════════════════════
  // BREAKFAST — VEG (15 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'idli_sambar',
    name: 'Idli with Sambar & Chutney',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'idli', grams: 160, label: '4 idli' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
      { foodId: 'coconut_chutney', grams: 30, label: '2 tbsp coconut chutney' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'rava_upma_chutney',
    name: 'Rava Upma & Chutney',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'rava_upma', grams: 250, label: '1.5 cups rava upma' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'buttermilk', grams: 200, label: '1 glass buttermilk' },
    ],
  },
  {
    id: 'pesarattu_chutney',
    name: 'Pesarattu (Moong Dosa)',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'pesarattu', grams: 200, label: '2 pesarattu' },
      { foodId: 'ginger_chutney', grams: 30, label: 'Ginger chutney' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'oats_banana',
    name: 'Oats Porridge with Banana',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'oats_cooked', grams: 300, label: '1 cup oats porridge with milk' },
      { foodId: 'banana', grams: 120, label: '1 banana' },
      { foodId: 'almonds', grams: 7, label: '5 almonds' },
    ],
  },
  {
    id: 'ragi_porridge_buttermilk',
    name: 'Ragi Porridge (Ragi Koozh)',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'ragi_porridge', grams: 350, label: '1.5 cups ragi porridge' },
      { foodId: 'jaggery', grams: 15, label: '1 tbsp jaggery' },
      { foodId: 'buttermilk', grams: 200, label: '1 glass buttermilk' },
    ],
  },
  {
    id: 'pongal_chutney_sambar',
    name: 'Pongal with Chutney',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'ven_pongal', grams: 250, label: '1 cup ven pongal' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
    ],
  },
  {
    id: 'semiya_upma_fruit',
    name: 'Semiya Upma & Fruit',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'semiya_upma', grams: 250, label: '1.5 cups semiya upma' },
      { foodId: 'banana', grams: 120, label: '1 banana' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'dosa_sambar',
    name: 'Dosa & Sambar',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'plain_dosa', grams: 160, label: '2 plain dosa' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
    ],
  },
  {
    id: 'masala_dosa_chutney',
    name: 'Masala Dosa with Chutney',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'masala_dosa', grams: 150, label: '1 masala dosa' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'sambar', grams: 150, label: 'Small sambar' },
    ],
  },
  {
    id: 'poori_kurma',
    name: 'Poori with Kurma',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'poori', grams: 90, label: '3 poori' },
      { foodId: 'veg_kurma', grams: 200, label: '1 cup veg kurma' },
      { foodId: 'buttermilk', grams: 200, label: '1 glass buttermilk' },
    ],
  },
  {
    id: 'uttapam_chutney',
    name: 'Uttapam with Chutney',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'uttapam', grams: 240, label: '2 uttapam' },
      { foodId: 'tomato_chutney', grams: 30, label: 'Tomato chutney' },
      { foodId: 'sambar', grams: 150, label: 'Small sambar' },
    ],
  },
  {
    id: 'puttu_kadala',
    name: 'Puttu with Kadala Curry',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'puttu', grams: 200, label: '1 puttu' },
      { foodId: 'chana_masala', grams: 150, label: '1 cup kadala curry' },
      { foodId: 'banana', grams: 60, label: '0.5 banana' },
    ],
  },
  {
    id: 'idli_podi',
    name: 'Idli with Podi & Sesame Oil',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'idli', grams: 200, label: '5 idli' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'buttermilk', grams: 200, label: '1 glass buttermilk' },
    ],
  },
  {
    id: 'adai_aviyal',
    name: 'Adai with Aviyal',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'adai', grams: 200, label: '2 adai' },
      { foodId: 'aviyal', grams: 150, label: '0.75 cup aviyal' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
    ],
  },
  {
    id: 'appam_stew',
    name: 'Appam & Vegetable Stew',
    type: 'breakfast',
    category: 'veg',
    components: [
      { foodId: 'appam', grams: 120, label: '2 appam' },
      { foodId: 'veg_stew', grams: 200, label: '1 cup veg stew' },
      { foodId: 'banana', grams: 60, label: '0.5 banana' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // BREAKFAST — NON-VEG (10 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'egg_dosa_milk',
    name: 'Egg Dosa',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_dosa', grams: 240, label: '2 egg dosa' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'boiled_eggs_toast',
    name: 'Boiled Eggs & Toast',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_whole', grams: 165, label: '3 boiled eggs' },
      { foodId: 'brown_bread', grams: 60, label: '2 brown bread slices' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'egg_podimas_idli',
    name: 'Egg Podimas & Idli',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_podimas', grams: 120, label: '2 egg podimas' },
      { foodId: 'idli', grams: 120, label: '3 idli' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Chutney' },
    ],
  },
  {
    id: 'omelette_dosa',
    name: 'Omelette & Dosa',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_omelette', grams: 120, label: '2 egg omelette' },
      { foodId: 'plain_dosa', grams: 80, label: '1 dosa' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'egg_uttapam_meal',
    name: 'Egg Uttapam',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_uttapam', grams: 300, label: '2 egg uttapam' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
    ],
  },
  {
    id: 'egg_parotta_salna',
    name: 'Egg Parotta & Salna',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_parotta', grams: 120, label: '1 egg parotta' },
      { foodId: 'chicken_salna', grams: 150, label: 'Chicken salna' },
      { foodId: 'milk_whole', grams: 200, label: '1 glass milk' },
    ],
  },
  {
    id: 'egg_fried_rice_breakfast',
    name: 'Egg Fried Rice (Light)',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_fried_rice', grams: 200, label: '1 cup egg fried rice' },
      { foodId: 'buttermilk', grams: 200, label: '1 glass buttermilk' },
    ],
  },
  {
    id: 'idli_egg_curry',
    name: 'Idli with Egg Curry',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'idli', grams: 120, label: '3 idli' },
      { foodId: 'egg_curry', grams: 200, label: '1 cup egg curry' },
    ],
  },
  {
    id: 'omelette_toast_banana',
    name: 'Omelette Toast & Banana',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'egg_omelette', grams: 120, label: '2 egg omelette' },
      { foodId: 'brown_bread', grams: 60, label: '2 toast slices' },
      { foodId: 'banana', grams: 120, label: '1 banana' },
    ],
  },
  {
    id: 'appam_egg_curry',
    name: 'Appam with Egg Curry',
    type: 'breakfast',
    category: 'nonveg',
    components: [
      { foodId: 'appam', grams: 120, label: '2 appam' },
      { foodId: 'egg_curry', grams: 200, label: '1 cup egg curry' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LUNCH — VEG (15 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'sambar_rice_poriyal',
    name: 'Sambar Sadam with Poriyal',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'sambar_rice', grams: 300, label: '1.5 cups sambar rice' },
      { foodId: 'beans_poriyal', grams: 100, label: '1 cup beans poriyal' },
      { foodId: 'appalam', grams: 10, label: '1 appalam' },
      { foodId: 'curd', grams: 50, label: 'Small curd' },
    ],
  },
  {
    id: 'curd_rice_pickle',
    name: 'Thayir Sadam & Pickle',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'curd_rice', grams: 300, label: '1.5 cups curd rice' },
      { foodId: 'pickle', grams: 15, label: 'Mango pickle' },
      { foodId: 'cabbage_poriyal', grams: 100, label: '1 cup poriyal' },
      { foodId: 'appalam', grams: 10, label: 'Appalam' },
    ],
  },
  {
    id: 'lemon_rice_kootu',
    name: 'Lemon Rice & Kootu',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'lemon_rice', grams: 300, label: '1.5 cups lemon rice' },
      { foodId: 'kootu', grams: 200, label: '1 cup chow chow kootu' },
      { foodId: 'appalam', grams: 10, label: 'Appalam' },
    ],
  },
  {
    id: 'rasam_rice_poriyal',
    name: 'Rasam Rice & Poriyal',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'rasam', grams: 200, label: '1 cup rasam' },
      { foodId: 'cabbage_poriyal', grams: 100, label: 'Cabbage poriyal' },
      { foodId: 'curd', grams: 50, label: 'Small curd' },
    ],
  },
  {
    id: 'tomato_rice_raita',
    name: 'Tomato Rice with Raita',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'tomato_rice', grams: 300, label: '1.5 cups tomato rice' },
      { foodId: 'raita', grams: 100, label: '0.5 cup raita' },
      { foodId: 'appalam', grams: 10, label: 'Appalam' },
    ],
  },
  {
    id: 'puliyodarai_vada',
    name: 'Puliyodarai & Vadai',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'puliyodarai', grams: 300, label: '1.5 cups puliyodarai' },
      { foodId: 'medhu_vada', grams: 50, label: '1 medhu vada' },
    ],
  },
  {
    id: 'keerai_sadam_mor_kuzhambu',
    name: 'Keerai Sadam & Mor Kuzhambu',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'keerai_sadam', grams: 300, label: '1.5 cups keerai sadam' },
      { foodId: 'mor_kuzhambu', grams: 200, label: '1 cup mor kuzhambu' },
      { foodId: 'carrot_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'rice_dal_poriyal',
    name: 'Rice, Dal & Poriyal',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'toor_dal', grams: 200, label: '1 cup toor dal' },
      { foodId: 'beans_poriyal', grams: 100, label: 'Beans poriyal' },
    ],
  },
  {
    id: 'chapati_paneer_masala',
    name: 'Chapati & Paneer Butter Masala',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'paneer_butter_masala', grams: 200, label: '1 cup paneer butter masala' },
      { foodId: 'raita', grams: 100, label: 'Raita' },
    ],
  },
  {
    id: 'chapati_palak_paneer',
    name: 'Chapati & Palak Paneer',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'palak_paneer', grams: 200, label: '1 cup palak paneer' },
      { foodId: 'curd', grams: 100, label: 'Curd' },
    ],
  },
  {
    id: 'rice_soya_curry',
    name: 'Rice & Soya Chunk Curry',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'soya_chunk_curry', grams: 150, label: '1 cup soya chunk curry' },
      { foodId: 'carrot_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'chapati_chana_masala',
    name: 'Chapati & Chana Masala',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'chana_masala', grams: 200, label: '1 cup chana masala' },
      { foodId: 'raita', grams: 100, label: 'Raita' },
    ],
  },
  {
    id: 'chapati_rajma',
    name: 'Chapati & Rajma',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'rajma_cooked', grams: 200, label: '1 cup rajma' },
      { foodId: 'curd', grams: 100, label: 'Curd' },
    ],
  },
  {
    id: 'rice_sambar_aviyal',
    name: 'Rice, Sambar & Aviyal',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
      { foodId: 'aviyal', grams: 150, label: 'Aviyal' },
    ],
  },
  {
    id: 'rice_keerai_masiyal',
    name: 'Rice & Keerai Masiyal',
    type: 'lunch',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'keerai_masiyal', grams: 200, label: '1 cup keerai masiyal' },
      { foodId: 'rasam', grams: 200, label: '1 cup rasam' },
      { foodId: 'appalam', grams: 10, label: 'Appalam' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // LUNCH — NON-VEG (10 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'meen_kuzhambu_rice',
    name: 'Meen Kuzhambu with Rice',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'meen_kuzhambu', grams: 200, label: '150g fish kuzhambu' },
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'beans_poriyal', grams: 100, label: 'Keerai poriyal' },
    ],
  },
  {
    id: 'chicken_rasam_rice',
    name: 'Chicken Rasam Rice',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'chicken_rasam', grams: 200, label: '100g chicken rasam' },
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'cabbage_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'chicken_biryani_raita',
    name: 'Chicken Biryani & Raita',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'chicken_biryani', grams: 350, label: '1.5 cups chicken biryani' },
      { foodId: 'raita', grams: 100, label: 'Raita' },
    ],
  },
  {
    id: 'chapati_chettinad_chicken',
    name: 'Chapati & Chettinad Chicken',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'chicken_curry_chettinad', grams: 200, label: '1 cup chettinad chicken' },
      { foodId: 'raita', grams: 100, label: 'Raita' },
    ],
  },
  {
    id: 'rice_egg_curry',
    name: 'Rice & Egg Curry',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'egg_curry', grams: 200, label: '1 cup egg curry' },
      { foodId: 'beans_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'rice_prawn_masala',
    name: 'Rice & Prawn Masala',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'prawn_masala', grams: 200, label: '1 cup prawn masala' },
      { foodId: 'cabbage_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'chapati_fish_curry',
    name: 'Chapati & Fish Curry',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'chapati', grams: 105, label: '3 chapati' },
      { foodId: 'meen_kuzhambu', grams: 200, label: '1 cup meen kuzhambu' },
      { foodId: 'carrot_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'rice_chicken_curry_rasam',
    name: 'Rice, Chicken Curry & Rasam',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'chicken_curry_chettinad', grams: 150, label: 'Chicken curry' },
      { foodId: 'rasam', grams: 150, label: 'Rasam' },
    ],
  },
  {
    id: 'egg_fried_rice_chicken',
    name: 'Egg Fried Rice & Grilled Chicken',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'egg_fried_rice', grams: 300, label: '1.5 cups egg fried rice' },
      { foodId: 'chicken_grilled_pieces', grams: 80, label: 'Grilled chicken side' },
    ],
  },
  {
    id: 'rice_fish_fry_sambar',
    name: 'Rice, Fish Fry & Sambar',
    type: 'lunch',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 270, label: '1.5 cups rice' },
      { foodId: 'fish_fry', grams: 100, label: '1 fish fry piece' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // DINNER — VEG (12 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'ragi_dosa_chutney_dinner',
    name: 'Ragi Dosa with Chutney',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'ragi_dosa', grams: 160, label: '2 ragi dosa' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
      { foodId: 'mor_kuzhambu', grams: 200, label: '1 cup mor kuzhambu' },
    ],
  },
  {
    id: 'chapati_dal_dinner',
    name: 'Chapati & Dal',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 70, label: '2 chapati' },
      { foodId: 'toor_dal', grams: 200, label: '1 cup dal' },
      { foodId: 'carrot_poriyal', grams: 80, label: 'Small salad' },
    ],
  },
  {
    id: 'idiyappam_stew_dinner',
    name: 'Idiyappam & Vegetable Stew',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'idiyappam', grams: 150, label: '3 idiyappam' },
      { foodId: 'veg_stew', grams: 200, label: '1 cup veg stew' },
    ],
  },
  {
    id: 'adai_aviyal_dinner',
    name: 'Adai with Aviyal',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'adai', grams: 200, label: '2 adai' },
      { foodId: 'aviyal', grams: 150, label: '0.75 cup aviyal' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Coconut chutney' },
    ],
  },
  {
    id: 'dosa_sambar_dinner',
    name: 'Dosa & Sambar',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'plain_dosa', grams: 160, label: '2 plain dosa' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Chutney' },
    ],
  },
  {
    id: 'kambu_koozh_dinner',
    name: 'Kambu Koozh & Side',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'kambu_koozh', grams: 350, label: '1.5 cups kambu koozh' },
      { foodId: 'cabbage_poriyal', grams: 100, label: 'Onion, green chilli side' },
    ],
  },
  {
    id: 'appam_kurma_dinner',
    name: 'Appam & Veg Kurma',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'appam', grams: 120, label: '2 appam' },
      { foodId: 'veg_kurma', grams: 200, label: '1 cup veg kurma' },
    ],
  },
  {
    id: 'chapati_paneer_dinner',
    name: 'Chapati & Palak Paneer',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 70, label: '2 chapati' },
      { foodId: 'palak_paneer', grams: 200, label: '1 cup palak paneer' },
    ],
  },
  {
    id: 'rice_moong_dal_dinner',
    name: 'Rice & Moong Dal',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'white_rice', grams: 180, label: '1 cup rice' },
      { foodId: 'moong_dal', grams: 200, label: '1 cup moong dal' },
      { foodId: 'beans_poriyal', grams: 100, label: 'Poriyal' },
    ],
  },
  {
    id: 'idli_sambar_dinner',
    name: 'Idli & Sambar (Light)',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'idli', grams: 120, label: '3 idli' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
      { foodId: 'coconut_chutney', grams: 30, label: 'Chutney' },
    ],
  },
  {
    id: 'uttapam_dinner',
    name: 'Uttapam & Sambar',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'uttapam', grams: 240, label: '2 uttapam' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
    ],
  },
  {
    id: 'chapati_soya_curry_dinner',
    name: 'Chapati & Soya Chunk Curry',
    type: 'dinner',
    category: 'veg',
    components: [
      { foodId: 'chapati', grams: 70, label: '2 chapati' },
      { foodId: 'soya_chunk_curry', grams: 150, label: '1 cup soya curry' },
      { foodId: 'curd', grams: 100, label: 'Curd' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // DINNER — NON-VEG (8 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'chapati_chicken_dinner',
    name: 'Chapati & Chicken Curry',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'chapati', grams: 70, label: '2 chapati' },
      { foodId: 'chicken_curry_chettinad', grams: 200, label: '1 cup chicken curry' },
    ],
  },
  {
    id: 'rice_fish_curry_dinner',
    name: 'Rice & Fish Curry',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 180, label: '1 cup rice' },
      { foodId: 'meen_kuzhambu', grams: 200, label: '1 cup meen kuzhambu' },
      { foodId: 'carrot_poriyal', grams: 80, label: 'Poriyal' },
    ],
  },
  {
    id: 'egg_dosa_dinner',
    name: 'Egg Dosa & Sambar',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'egg_dosa', grams: 240, label: '2 egg dosa' },
      { foodId: 'sambar', grams: 200, label: '1 cup sambar' },
    ],
  },
  {
    id: 'idiyappam_chicken_stew',
    name: 'Idiyappam & Chicken Stew',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'idiyappam', grams: 150, label: '3 idiyappam' },
      { foodId: 'chicken_salna', grams: 200, label: '1 cup chicken stew' },
    ],
  },
  {
    id: 'chapati_egg_curry_dinner',
    name: 'Chapati & Egg Curry',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'chapati', grams: 70, label: '2 chapati' },
      { foodId: 'egg_curry', grams: 200, label: '1 cup egg curry' },
      { foodId: 'curd', grams: 100, label: 'Curd' },
    ],
  },
  {
    id: 'rice_prawn_dinner',
    name: 'Rice & Prawn Masala',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'white_rice', grams: 180, label: '1 cup rice' },
      { foodId: 'prawn_masala', grams: 200, label: '1 cup prawn masala' },
      { foodId: 'rasam', grams: 150, label: 'Rasam' },
    ],
  },
  {
    id: 'parotta_chicken_salna_dinner',
    name: 'Parotta & Chicken Salna',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'parotta', grams: 80, label: '1 parotta' },
      { foodId: 'chicken_salna', grams: 200, label: '1 cup chicken salna' },
    ],
  },
  {
    id: 'appam_fish_curry_dinner',
    name: 'Appam & Fish Curry',
    type: 'dinner',
    category: 'nonveg',
    components: [
      { foodId: 'appam', grams: 120, label: '2 appam' },
      { foodId: 'meen_kuzhambu', grams: 200, label: '1 cup meen kuzhambu' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SNACKS — VEG (12 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'banana_peanuts_snack',
    name: 'Banana & Peanuts',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'banana', grams: 120, label: '1 banana' },
      { foodId: 'peanut_butter', grams: 16, label: '1 tbsp peanut butter' },
      { foodId: 'almonds', grams: 7, label: '5 almonds' },
    ],
  },
  {
    id: 'fruit_nuts_snack',
    name: 'Fruit & Nuts',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'apple', grams: 180, label: '1 apple' },
      { foodId: 'mixed_nuts', grams: 25, label: 'Handful mixed nuts' },
    ],
  },
  {
    id: 'sprouted_sundal_snack',
    name: 'Sprouted Sundal',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'moong_sundal', grams: 130, label: '0.5 cup sprouted moong sundal' },
    ],
  },
  {
    id: 'buttermilk_murukku_snack',
    name: 'Buttermilk & Murukku',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'buttermilk', grams: 200, label: '1 glass neer moru' },
      { foodId: 'murukku', grams: 30, label: '2 small murukku' },
    ],
  },
  {
    id: 'peanut_chikki_milk_snack',
    name: 'Peanut Chikki & Milk',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'peanut_chikki', grams: 25, label: '1 small peanut chikki' },
      { foodId: 'milk_whole', grams: 100, label: '0.5 glass milk' },
    ],
  },
  {
    id: 'yogurt_dates_snack',
    name: 'Yogurt & Dates',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'curd', grams: 100, label: '0.5 cup curd' },
      { foodId: 'dates', grams: 20, label: '2 dates' },
      { foodId: 'cashews', grams: 8, label: '3 cashews' },
    ],
  },
  {
    id: 'sweet_potato_snack',
    name: 'Boiled Sweet Potato',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'sweet_potato', grams: 150, label: '1 medium sweet potato' },
    ],
  },
  {
    id: 'chana_sundal_snack',
    name: 'Chana Sundal & Fruit',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'chana_sundal', grams: 130, label: '1 cup chana sundal' },
      { foodId: 'orange', grams: 90, label: '0.5 orange' },
    ],
  },
  {
    id: 'peanut_sundal_snack',
    name: 'Peanut Sundal',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'peanut_sundal', grams: 60, label: '0.75 cup peanut sundal' },
    ],
  },
  {
    id: 'roasted_chana_jaggery_snack',
    name: 'Roasted Chana & Jaggery',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'roasted_chana', grams: 50, label: '0.5 cup roasted chana' },
      { foodId: 'jaggery', grams: 10, label: '1 small piece jaggery' },
    ],
  },
  {
    id: 'masala_muri_snack',
    name: 'Masala Muri (Puffed Rice)',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'puffed_rice', grams: 30, label: '1 cup masala puffed rice' },
      { foodId: 'peanuts_roasted', grams: 15, label: 'Few peanuts' },
    ],
  },
  {
    id: 'fruit_salad_honey_snack',
    name: 'Fruit Salad',
    type: 'snack',
    category: 'veg',
    components: [
      { foodId: 'mixed_fruits', grams: 200, label: '1 cup mixed fruit salad' },
      { foodId: 'honey', grams: 7, label: '1 tsp honey' },
    ],
  },

  // ═══════════════════════════════════════════════════════
  // SNACKS — NON-VEG (6 templates)
  // ═══════════════════════════════════════════════════════
  {
    id: 'boiled_eggs_fruit_snack',
    name: 'Boiled Eggs & Fruit',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'egg_whole', grams: 110, label: '2 boiled eggs' },
      { foodId: 'banana', grams: 120, label: '1 banana' },
    ],
  },
  {
    id: 'egg_white_toast_snack',
    name: 'Egg White & Toast',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'egg_white', grams: 100, label: '3 egg whites' },
      { foodId: 'brown_bread', grams: 30, label: '1 brown bread slice' },
    ],
  },
  {
    id: 'chicken_strips_snack',
    name: 'Chicken Strips & Cucumber',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'chicken_grilled_pieces', grams: 80, label: '80g grilled chicken strips' },
    ],
  },
  {
    id: 'peanut_butter_toast_snack',
    name: 'Peanut Butter Toast',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'brown_bread', grams: 30, label: '1 brown bread' },
      { foodId: 'peanut_butter', grams: 32, label: '2 tbsp peanut butter' },
    ],
  },
  {
    id: 'banana_nuts_snack_nv',
    name: 'Banana & Nuts',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'banana', grams: 120, label: '1 banana' },
      { foodId: 'mixed_nuts', grams: 25, label: 'Handful mixed nuts' },
    ],
  },
  {
    id: 'yogurt_fruit_snack_nv',
    name: 'Yogurt & Fruit',
    type: 'snack',
    category: 'nonveg',
    components: [
      { foodId: 'curd', grams: 100, label: '0.5 cup yogurt' },
      { foodId: 'banana', grams: 60, label: '0.5 banana' },
    ],
  },
];

// Helper: get templates by type
export function getTemplatesByType(type) {
  return mealTemplates.filter((t) => t.type === type);
}

// Helper: get templates by category and type
export function getTemplatesByCategoryAndType(category, type) {
  return mealTemplates.filter((t) => {
    const categoryMatch = category === 'nonveg' ? true : t.category === 'veg';
    return categoryMatch && t.type === type;
  });
}
