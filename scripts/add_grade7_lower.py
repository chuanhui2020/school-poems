# -*- coding: utf-8 -*-
import json

with open('src/data/poems.json', 'r') as f:
    poems = json.load(f)

existing_ids = {p['id'] for p in poems}

new_poems = [
  {"id":"mu-lan-shi","title":"木兰诗","authorId":"anonymous","dynastyId":"wei-jin","form":"乐府诗","approximate_year":500,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"唧唧复唧唧，木兰当户织。不闻机杼声，唯闻女叹息。\n问女何所思，问女何所忆。女亦无所思，女亦无所忆。昨夜见军帖，可汗大点兵，军书十二卷，卷卷有爷名。阿爷无大儿，木兰无长兄，愿为市鞍马，从此替爷征。\n东市买骏马，西市买鞍鞯，南市买辔头，北市买长鞭。旦辞爷娘去，暮宿黄河边，不闻爷娘唤女声，但闻黄河流水鸣溅溅。旦辞黄河去，暮至黑山头，不闻爷娘唤女声，但闻燕山胡骑鸣啾啾。\n万里赴戎机，关山度若飞。朔气传金柝，寒光照铁衣。将军百战死，壮士十年归。\n归来见天子，天子坐明堂。策勋十二转，赏赐百千强。可汗问所欲，木兰不用尚书郎，愿驰千里足，送儿还故乡。\n爷娘闻女来，出郭相扶将；阿姊闻妹来，当户理红妆；小弟闻姊来，磨刀霍霍向猪羊。开我东阁门，坐我西阁床，脱我战时袍，著我旧时裳。当窗理云鬓，对镜帖花黄。出门看火伴，火伴皆惊忙：同行十二年，不知木兰是女郎。\n雄兔脚扑朔，雌兔眼迷离；双兔傍地走，安能辨我是雄雌？","themes":["aiguo","zhuangzhi"],"imagery":["山","江/河"],"mood":"英勇豪迈","annotation":"北朝乐府民歌，讲述木兰女扮男装替父从军的故事，歌颂了木兰的勇敢和孝心。","translation":"木兰替父从军，征战十年凯旋，不愿做官只愿回乡，恢复女儿装后同行伙伴皆惊。"},
  {"id":"deng-youzhou-tai-ge","title":"登幽州台歌","authorId":"chen-ziang","dynastyId":"tang","form":"古体诗","approximate_year":696,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"前不见古人，后不见来者。\n念天地之悠悠，独怆然而涕下！","themes":["rensheng","yongshi"],"imagery":[],"mood":"孤独悲怆","annotation":"陈子昂随军北征时登蓟北楼所作。感慨生不逢时、怀才不遇。","translation":"往前看不到古代的贤君，往后看不到后世的明主。想到天地的广阔无穷，独自悲伤地流下眼泪。"},
  {"id":"wang-yue","title":"望岳","authorId":"du-fu","dynastyId":"tang","form":"五言古诗","approximate_year":736,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"岱宗夫如何？齐鲁青未了。\n造化钟神秀，阴阳割昏晓。\n荡胸生曾云，决眦入归鸟。\n会当凌绝顶，一览众山小。","themes":["zhuangzhi","shanshui"],"imagery":["山","云","鸟"],"mood":"豪迈壮志","annotation":"杜甫青年时游泰山所作。「会当凌绝顶，一览众山小」表达勇攀高峰的壮志。","translation":"泰山到底怎么样？齐鲁大地都看不尽它的青翠。一定要登上泰山的最高峰，俯瞰群山都变得渺小。"},
  {"id":"deng-fei-lai-feng","title":"登飞来峰","authorId":"wang-anshi","dynastyId":"song","form":"七言绝句","approximate_year":1050,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"飞来山上千寻塔，闻说鸡鸣见日升。\n不畏浮云遮望眼，自缘身在最高层。","themes":["zhuangzhi","rensheng"],"imagery":["山","云","日"],"mood":"自信豪迈","annotation":"王安石登飞来峰时所作。「不畏浮云遮望眼」表达高瞻远瞩的政治抱负。","translation":"飞来峰上耸立着千寻高的塔，听说鸡鸣时分可以看见太阳升起。不怕浮云遮住远望的视线，只因为自己站在最高的地方。"},
  {"id":"you-shan-xi-cun","title":"游山西村","authorId":"lu-you","dynastyId":"song","form":"七言律诗","approximate_year":1167,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"莫笑农家腊酒浑，丰年留客足鸡豚。\n山重水复疑无路，柳暗花明又一村。\n箫鼓追随春社近，衣冠简朴古风存。\n从今若许闲乘月，拄杖无时夜叩门。","themes":["tianyuan","rensheng"],"imagery":["山","花","柳","月","春"],"mood":"闲适愉悦","annotation":"陆游闲居山阴时所作。「山重水复疑无路，柳暗花明又一村」蕴含人生哲理。","translation":"不要笑话农家的腊月酒浑浊，丰收之年待客菜肴十分丰盛。山峦重叠水流曲折正担心无路可走，忽然柳绿花红又出现一个村庄。"},
  {"id":"ji-hai-za-shi-qi-wu","title":"己亥杂诗（其五）","authorId":"gong-zizhen","dynastyId":"qing","form":"七言绝句","approximate_year":1839,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"浩荡离愁白日斜，吟鞭东指即天涯。\n落红不是无情物，化作春泥更护花。","themes":["aiguo","rensheng"],"imagery":["日","花","春"],"mood":"豁达奉献","annotation":"龚自珍辞官南归途中所作。「落红不是无情物，化作春泥更护花」以落花自喻，表达虽离官场仍心系国家。","translation":"浩浩荡荡的离别愁绪向着日落西斜的远处延伸。落花不是无情之物，化作春泥后更能护育新花。"},
  {"id":"zhu-li-guan","title":"竹里馆","authorId":"wang-wei","dynastyId":"tang","form":"五言绝句","approximate_year":740,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"独坐幽篁里，弹琴复长啸。\n深林人不知，明月来相照。","themes":["tianyuan","rensheng"],"imagery":["月"],"mood":"幽静闲适","annotation":"王维隐居辋川时所作。独坐竹林弹琴，唯有明月相伴，表达超然物外的心境。","translation":"独自坐在幽深的竹林里，一边弹琴一边长啸。深深的林中无人知晓，只有一轮明月来相伴照耀。"},
  {"id":"chun-ye-luo-cheng-wen-di","title":"春夜洛城闻笛","authorId":"li-bai","dynastyId":"tang","form":"七言绝句","approximate_year":735,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"谁家玉笛暗飞声，散入春风满洛城。\n此夜曲中闻折柳，何人不起故园情。","themes":["sixiang"],"imagery":["风","春","柳"],"mood":"思乡","annotation":"李白客居洛阳时春夜闻笛所作。「折柳」曲勾起思乡之情。","translation":"是谁家的玉笛声暗暗飞出，随着春风飘散弥漫了整个洛阳城。在这个夜晚听到折杨柳的曲子，谁能不生起思念故乡的感情呢。"},
  {"id":"feng-ru-jing-shi","title":"逢入京使","authorId":"cen-shen","dynastyId":"tang","form":"七言绝句","approximate_year":749,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"故园东望路漫漫，双袖龙钟泪不干。\n马上相逢无纸笔，凭君传语报平安。","themes":["sixiang"],"imagery":[],"mood":"思乡","annotation":"岑参赴安西途中遇到回京使者所作。「马上相逢无纸笔」表达游子思乡的朴素情感。","translation":"向东遥望故乡路途遥远，双袖已被泪水打湿。在马上匆匆相逢没有纸笔，只好托你带个口信给家人报个平安。"},
  {"id":"wan-chun","title":"晚春","authorId":"han-yu","dynastyId":"tang","form":"七言绝句","approximate_year":816,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"草树知春不久归，百般红紫斗芳菲。\n杨花榆荚无才思，惟解漫天作雪飞。","themes":["yongwu","rensheng"],"imagery":["花","草","树/木","春","雪"],"mood":"生趣盎然","annotation":"韩愈以拟人手法写暮春景象。草木争奇斗艳，杨花榆荚虽无花色却漫天飞舞。","translation":"花草树木知道春天即将归去，都竞相展示各种红紫色彩争奇斗艳。杨花和榆荚没有美丽的姿色，只懂得漫天飞舞像雪花一样飘洒。"},
  {"id":"bo-qin-huai","title":"泊秦淮","authorId":"du-mu","dynastyId":"tang","form":"七言绝句","approximate_year":833,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"烟笼寒水月笼沙，夜泊秦淮近酒家。\n商女不知亡国恨，隔江犹唱后庭花。","themes":["yongshi","zhizheng"],"imagery":["月","江/河","酒"],"mood":"忧国感伤","annotation":"杜牧夜泊秦淮河畔所作。借陈后主亡国之曲讽刺晚唐统治者醉生梦死。","translation":"烟雾笼罩着寒冷的水面，月光笼罩着沙滩。歌女不知道亡国的悲恨，隔着江水还在唱着《玉树后庭花》。"},
  {"id":"jia-sheng","title":"贾生","authorId":"li-shangyin","dynastyId":"tang","form":"七言绝句","approximate_year":848,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"宣室求贤访逐臣，贾生才调更无伦。\n可怜夜半虚前席，不问苍生问鬼神。","themes":["yongshi","zhizheng"],"imagery":[],"mood":"讽刺感慨","annotation":"李商隐借汉文帝召见贾谊的故事讽喻时政。表面赞汉文帝求贤，实则讽刺其不问民生只问鬼神。","translation":"汉文帝在宣室中求访贤才召见被贬的臣子，贾谊的才华更是无人能比。可惜文帝半夜里向前移动身子倾听，问的不是天下苍生的事而是鬼神之事。"},
  {"id":"guo-songyuan-chenchu-qigongdian","title":"过松源晨炊漆公店（其五）","authorId":"yang-wanli","dynastyId":"song","form":"七言绝句","approximate_year":1190,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"莫言下岭便无难，赚得行人错喜欢。\n正入万山圈子里，一山放过一山拦。","themes":["rensheng"],"imagery":["山"],"mood":"哲理深思","annotation":"杨万里翻越松源岭后所作。以下山后仍有山拦路的经历，揭示困难接连不断的哲理。","translation":"不要说从山岭上下来就没有困难了。正当你进入万山的包围之中，一座山刚放过你，另一座山又拦住了去路。"},
  {"id":"yue-ke","title":"约客","authorId":"zhao-shixiu","dynastyId":"song","form":"七言绝句","approximate_year":1200,"curriculum_level":"middle_school","grade":"七年级下册","full_text":"黄梅时节家家雨，青草池塘处处蛙。\n有约不来过夜半，闲敲棋子落灯花。","themes":["rensheng"],"imagery":["雨","草"],"mood":"闲适等待","annotation":"赵师秀写梅雨季节等候友人来访的情景。「闲敲棋子落灯花」传神地表现了等待中的闲适。","translation":"梅雨时节家家户户都在下雨，长满青草的池塘边处处是蛙声。约好的客人过了半夜还没来，我闲着无事敲着棋子，震落了灯花。"}
]

added = 0
for p in new_poems:
    if p['id'] not in existing_ids:
        poems.append(p)
        existing_ids.add(p['id'])
        added += 1

with open('src/data/poems.json', 'w') as f:
    json.dump(poems, f, ensure_ascii=False, indent=2)

print(f"Added {added} grade 7 lower poems, total: {len(poems)}")
