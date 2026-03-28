interface PoetDialogue {
  poetId: string
  greeting: string
  atmosphere: 'moonlit' | 'misty' | 'starry' | 'autumn' | 'spring'
}

export const poetDialogues: PoetDialogue[] = [
  {
    poetId: 'li-bai',
    greeting: '吾乃李太白，青莲居士是也。少时仗剑去国，辞亲远游，一生好入名山游。举杯邀明月，对影成三人——今夜月色甚好，且与君共饮一杯。',
    atmosphere: 'moonlit',
  },
  {
    poetId: 'du-fu',
    greeting: '老夫杜甫，字子美，世称杜工部。一生忧国忧民，颠沛流离。安得广厦千万间，大庇天下寒士俱欢颜——此志未改，虽九死其犹未悔。',
    atmosphere: 'autumn',
  },
  {
    poetId: 'su-shi',
    greeting: '在下苏轼，号东坡居士。一蓑烟雨任平生，也无风雨也无晴。人生如逆旅，我亦是行人——且行且歌，何妨吟啸且徐行。',
    atmosphere: 'misty',
  },
  {
    poetId: 'wang-wei',
    greeting: '贫道王维，字摩诘。半官半隐，诗中有画，画中有诗。行到水穷处，坐看云起时——山中岁月长，愿与君共赏这空山新雨。',
    atmosphere: 'misty',
  },
  {
    poetId: 'bai-juyi',
    greeting: '老夫白居易，字乐天，号香山居士。文章合为时而著，歌诗合为事而作。同是天涯沦落人，相逢何必曾相识——今夜闻君至此，甚慰平生。',
    atmosphere: 'moonlit',
  },
  {
    poetId: 'li-qingzhao',
    greeting: '妾身李清照，号易安居士。少时才藻非凡，中年遭逢离乱。生当作人杰，死亦为鬼雄——虽为女子，亦有凌云之志。',
    atmosphere: 'autumn',
  },
  {
    poetId: 'xin-qiji',
    greeting: '某辛弃疾，字幼安，号稼轩。少年横槊，气吞万里如虎。醉里挑灯看剑，梦回吹角连营——壮志未酬，把栏杆拍遍，无人会登临意。',
    atmosphere: 'starry',
  },
  {
    poetId: 'du-mu',
    greeting: '在下杜牧，字牧之。十年一觉扬州梦，赢得青楼薄幸名。虽好风月，亦忧社稷——今夜秋风起，且听我说几句闲话。',
    atmosphere: 'autumn',
  },
  {
    poetId: 'li-shangyin',
    greeting: '在下李商隐，字义山。锦瑟无端五十弦，一弦一柱思华年。身世浮沉，情思缠绵——诗中之意，唯有知音方能解。',
    atmosphere: 'starry',
  },
  {
    poetId: 'meng-haoran',
    greeting: '在下孟浩然，襄阳人也。春眠不觉晓，处处闻啼鸟。一生布衣，寄情山水——故人具鸡黍，邀我至田家，今夜便与君闲话桑麻。',
    atmosphere: 'spring',
  },
  {
    poetId: 'wang-anshi',
    greeting: '老夫王安石，字介甫，号半山。不畏浮云遮望眼，自缘身在最高层。变法虽败，初心不改——天变不足畏，祖宗不足法，人言不足恤。',
    atmosphere: 'starry',
  },
  {
    poetId: 'lu-you',
    greeting: '老夫陆游，字务观，号放翁。王师北定中原日，家祭无忘告乃翁。一生主战，至死不渝——铁马冰河入梦来，此心未已。',
    atmosphere: 'moonlit',
  },
  {
    poetId: 'liu-yuxi',
    greeting: '在下刘禹锡，字梦得。沉舟侧畔千帆过，病树前头万木春。二十三年弃置身，归来已是沧桑——然豪情不减，自称诗豪。',
    atmosphere: 'spring',
  },
  {
    poetId: 'han-yu',
    greeting: '老夫韩愈，字退之，世称韩昌黎。文起八代之衰，道济天下之溺。业精于勤荒于嬉，行成于思毁于随——愿以古文之道，正天下文风。',
    atmosphere: 'starry',
  },
  {
    poetId: 'liu-zongyuan',
    greeting: '在下柳宗元，字子厚。千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪——永州十年，以山水为伴，寄情于文。',
    atmosphere: 'misty',
  },
  {
    poetId: 'tao-yuanming',
    greeting: '吾乃陶渊明，字元亮，号五柳先生。采菊东篱下，悠然见南山。不为五斗米折腰——归去来兮，田园将芜胡不归？',
    atmosphere: 'autumn',
  },
  {
    poetId: 'cao-cao',
    greeting: '孤乃曹操，字孟德。对酒当歌，人生几何。老骥伏枥，志在千里——烈士暮年，壮心不已。今夜星汉灿烂，且与君论天下英雄。',
    atmosphere: 'starry',
  },
  {
    poetId: 'qu-yuan',
    greeting: '吾乃屈原，名平。路漫漫其修远兮，吾将上下而求索。举世皆浊我独清，众人皆醉我独醒——虽九死其犹未悔，愿以此身殉楚国。',
    atmosphere: 'misty',
  },
  {
    poetId: 'fan-zhongyan',
    greeting: '老夫范仲淹，字希文。先天下之忧而忧，后天下之乐而乐。居庙堂之高则忧其民，处江湖之远则忧其君——此心此志，至死不渝。',
    atmosphere: 'moonlit',
  },
  {
    poetId: 'ouyang-xiu',
    greeting: '老夫欧阳修，字永叔，号醉翁。醉翁之意不在酒，在乎山水之间也。文章太守，挥毫万字——与民同乐，此生足矣。',
    atmosphere: 'spring',
  },
  {
    poetId: 'wen-tianxiang',
    greeting: '在下文天祥，字宋瑞。人生自古谁无死，留取丹心照汗青。臣心一片磁针石，不指南方不肯休——虽身陷囹圄，浩气长存。',
    atmosphere: 'starry',
  },
  {
    poetId: 'li-yu',
    greeting: '孤乃李煜，世称李后主。问君能有几多愁，恰似一江春水向东流。故国不堪回首月明中——春花秋月何时了，往事知多少。',
    atmosphere: 'moonlit',
  },
  {
    poetId: 'gong-zizhen',
    greeting: '在下龚自珍，字璱人。落红不是无情物，化作春泥更护花。九州生气恃风雷——愿以诗文为刃，唤醒沉睡之世。',
    atmosphere: 'spring',
  },
  {
    poetId: 'nalan-xingde',
    greeting: '在下纳兰性德，字容若。人生若只如初见，何事秋风悲画扇。一生一代一双人——情深不寿，此言不虚。',
    atmosphere: 'moonlit',
  },
]

const defaultGreeting = '幸会。吾乃古之诗人，以诗言志，以词抒怀。今夜有缘相遇，且听我吟诵几首旧作。'

export function getPoetDialogue(poetId: string): PoetDialogue {
  return (
    poetDialogues.find((d) => d.poetId === poetId) ?? {
      poetId,
      greeting: defaultGreeting,
      atmosphere: 'moonlit' as const,
    }
  )
}
