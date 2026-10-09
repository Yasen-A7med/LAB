import type { QuestionItem, ArchetypeProfile, MetricCard } from './types';

export const QUIZ_QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    scenario: {
      en: 'You enter an enchanted emporium to choose a lifelong companion for your journey. Which companion do you choose?',
      ar: 'دخلتِ متجر كائنات سحرية عشان تختاري رفيق دائم لرحلتك، هتختاري مين؟'
    },
    options: {
      A: {
        en: 'A calm, powerful, and commanding white tiger that guards you with its piercing gaze.',
        ar: 'نمر أبيض هادئ، قوي ومسيطر، وبيحرسك بنظراته الواثقة.'
      },
      B: {
        en: 'A sharp, swift-witted falcon that scouts the path ahead from high above.',
        ar: 'صقر ذكي وسريع البديهة وبيستكشف الطريق من فوق.'
      },
      C: {
        en: 'A friendly, cheerful dolphin that radiates playfulness, warmth, and easy connection.',
        ar: 'دولفين ودود ومرح، بيحب اللعب والتواصل والتفاعل التلقائي.'
      },
      D: {
        en: 'A mysterious, fiercely loyal wolf that stays quiet and only steps forth in defining moments.',
        ar: 'ذئب غامض، مخلص جداً وقليل الظهور إلا في اللحظات الحاسمة.'
      }
    }
  },
  {
    id: 2,
    scenario: {
      en: 'A formidable beast suddenly emerges on your path! What immediate reaction do you want your companion to take?',
      ar: 'فجأة في طريق الرحلة طلع وحش ضخم، إيه رد الفعل اللي تحبي رفيقك يعمله فوراً؟'
    },
    options: {
      A: {
        en: 'Step firmly in front of you, facing the peril head-on to shield you completely.',
        ar: 'يقف قدامك بحزم ويواجه هو الخطر عشان يحميكي بالكامل.'
      },
      B: {
        en: 'Grab your hand and swiftly pull you away to a secure, fortified sanctuary.',
        ar: 'يمسك إيدك ويهرب بيكي بسرعة لمكان آمن ومطمئن.'
      },
      C: {
        en: 'Cover your back, strategize a clever coordinated plan, and strike together as a team.',
        ar: 'يقف في ضهرك ويفكر معاكي في خطة ذكية وتهجموا سوا كفريق متكافئ.'
      },
      D: {
        en: 'Distract the beast with agile, unexpected maneuvers until the danger dissipates.',
        ar: 'يشتت انتباه الوحش بحركات غير متوقعة وخفة حركة لحد ما الخطر يزول.'
      }
    }
  },
  {
    id: 3,
    scenario: {
      en: 'The ideal haven where you would genuinely love to spend an extended, peaceful retreat:',
      ar: 'المكان المثالي اللي تحبي تقضي فيه استراحة طويلة وتستعيدي هدوءك:'
    },
    options: {
      A: {
        en: 'A warm, secluded cabin by a serene lake, completely shielded from noise and unexpected visitors.',
        ar: 'كوخ دافئ ومعزول على بحيرة هادئة، بعيداً عن أي صخب أو زيارات مفاجئة.'
      },
      B: {
        en: 'A classic, luxurious manor imbued with timeless sophistication, refined aesthetics, and etiquette.',
        ar: 'قصر كلاسيكي فاخر مليان تفاصيل راقية وقوانين وأجواء مميزة.'
      },
      C: {
        en: 'A vibrant coastal city bursting with adventures, spontaneous outings, and lively nightlife.',
        ar: 'مدينة شاطئية حيوية كلها مغامرات وأنشطة وسهرات وتجارب يومية.'
      },
      D: {
        en: 'A rugged volcanic island offering untamed exploration, dynamic challenges, and endless discoveries.',
        ar: 'جزيرة بركانية وعرة فيها استكشاف وتحديات ومفاجآت مستمرة.'
      }
    }
  },
  {
    id: 4,
    scenario: {
      en: 'In gatherings with close friends, which style of humor genuinely makes you burst into real laughter?',
      ar: 'في قعدات الصحاب، أكتر نوع هزار وضحك بجد بيفصلك ويخليكي تضحكي من قلبك:'
    },
    options: {
      A: {
        en: 'Rapid-fire witty roasting, sharp banter, and clever conversational comebacks.',
        ar: 'النكش المتبادل وقصف الجبهات الذكي والمناكفة السريعة الحاضرة.'
      },
      B: {
        en: 'Understated, dry irony, meaningful subtle glances, and quiet coded remarks.',
        ar: 'السخرية الهادئة والنظرات ذات المغزى والغمزات والرموز المبطنة.'
      },
      C: {
        en: 'Spontaneous pranks, funny accidents, and naturally awkward, harmless moments.',
        ar: 'المقالب العفوية والمواقف المحرجة الطريفة غير المقصودة.'
      },
      D: {
        en: 'Out-of-the-blue silly punchlines, absurdity, and contagious laughter over trivial things.',
        ar: 'الإيفيهات غير المتوقعة والضحك على حاجات بسيطة وتافهة بكل عفوية.'
      }
    }
  },
  {
    id: 5,
    scenario: {
      en: 'If someone teasingly targets you with playful banter in the middle of a crowd, your natural reflex is:',
      ar: 'لو شخص ناكفك بهزار وسط تجمع ناس، رد فعلك التلقائي بيكون إيه؟'
    },
    options: {
      A: {
        en: 'Seize the stage and fire back instantly with a sharper, wittier comeback that turns the laughter on them.',
        ar: 'بستلم الموقف وأرد عليه فوراً بقصف جبهة أذكى وأضحك الناس كلها عليه.'
      },
      B: {
        en: 'Flash a cool, composed smile and remain silent, making them feel awkward and retreat.',
        ar: 'ببتسم بنظرة باردة وأسكت عشان أحرجه بهدوء وأخليه يراجع نفسه ويرجع لورا.'
      },
      C: {
        en: 'Laugh along comfortably, take the banter in stride, and treat it with zero sensitivity.',
        ar: 'بضحك عادي جداً وبساير الهزار، ومباخدش الموضوع بأي حساسية.'
      },
      D: {
        en: 'Offer a gentle, shy smile and tactfully guide the conversation in a different direction.',
        ar: 'ببتسم بخجل خفيف وأحاول أغير الموضوع بلطافة وهدوء.'
      }
    }
  },
  {
    id: 6,
    scenario: {
      en: 'In your ultimate dream home, the architectural concept of your private suite would be:',
      ar: 'في بيت أحلامك، نظام وتصميم غرفتك الخاصة هيكون عامل إزاي؟'
    },
    options: {
      A: {
        en: 'Perched on the highest floor with a fortified door secured by biometric access or private cipher.',
        ar: 'في أعلى مكان في البيت مع باب سميك مقفول دايماً ببصمة أو مفتاح سري خاص.'
      },
      B: {
        en: 'A deeply cozy space with an ajar door where trusted loved ones can enter without formal ceremony.',
        ar: 'مساحة مريحة بابها موارب، وعادي أي حد مقرب يدخل يقعد بدون استئذان معقد.'
      },
      C: {
        en: 'An airy glass sanctuary opening directly to a lush garden, dissolving all borders with nature.',
        ar: 'غرفة أغلبها زجاج ومفتوحة على حديقة كاشفة كل تفاصيل الطبيعة والشمس.'
      },
      D: {
        en: 'An elevated treehouse retreat with a retractable rope ladder that only lowers when you wish.',
        ar: 'بيت شجرة عالي جداً بسلم معلق، بينزل ويطلع بمزاجك إنتي وبس.'
      }
    }
  },
  {
    id: 7,
    scenario: {
      en: 'When participating in a team strategic endeavor, what kind of leader do you prefer having at the helm?',
      ar: 'لو بتلعبي لعبة استراتيجية في فريق، تفضلي القائد بتاعك يكون عامل إزاي؟'
    },
    options: {
      A: {
        en: 'A decisive, assertive leader who delegates tasks with firmness and shoulder full accountability.',
        ar: 'شخص حازم جداً ومتحكم، يوزع المهام بصرامة ويتحمل المسؤولية كاملة.'
      },
      B: {
        en: 'A highly flexible, diplomatic leader who consults everyone and ensures comfort and consensus.',
        ar: 'قائد مرن جداً، بياخد رأي الكل والقرارات عنده بالتشاور والراحة والهدوء.'
      },
      C: {
        en: 'A hands-off coordinator who grants absolute freedom and autonomous breathing room to everyone.',
        ar: 'شخص بيسيب لكل واحد مساحته وحريته المطلقة بدون أي توجيه أو ضغط.'
      },
      D: {
        en: 'I dislike being led—I either take the reins of leadership myself or operate completely independently.',
        ar: 'مبحبش حد يقودني أصلاً؛ أفضل أكون أنا اللي ماسكة القيادة أو مستقلة بذاتي.'
      }
    }
  },
  {
    id: 8,
    scenario: {
      en: 'If you were aboard a boat caught in a fierce sea storm, what scenario gives you authentic reassurance?',
      ar: 'لو راكبة قارب في بحر عاصف، التصرف اللي يديكي أمان حقيقي واطمئنان من جواكي:'
    },
    options: {
      A: {
        en: 'The captain directs you into the cabin, shuts the hatch, and tells you: "Leave everything to me."',
        ar: 'القبطان يطلب منك تدخلي الكابينة ويقفل الباب ويقولك: "سيبي كل حاجة عليا ومتقلقيش".'
      },
      B: {
        en: 'The captain has you sit beside them, explains every single maneuver step by step, and hears your thoughts.',
        ar: 'القبطان يقعدك جنبه يشرحلك الموقف خطوة بخطوة ويهديكي ويسمع رأيك.'
      },
      C: {
        en: 'They assist you in gripping the helm together, steering through the tempest as equal partners.',
        ar: 'يساعدك تمسكي معاه الدفة وتشاركوا سوا في توجيه القارب وتخطي الأمواج.'
      },
      D: {
        en: 'You immediately locate and secure the lifeboat yourself so you never rely solely on anyone else.',
        ar: 'تدوري بنفسك على قارب النجاة وسترة الإنقاذ عشان متكونيش معتمدة على قرارات حد.'
      }
    }
  },
  {
    id: 9,
    scenario: {
      en: 'You receive an exclusive invitation to a grand masquerade gala. Which ensemble do you choose to wear?',
      ar: 'لو معزومة على حفلة تنكرية كبيرة، تختاري تلبسي إيه عشان تحضري بيها؟'
    },
    options: {
      A: {
        en: 'A dazzling gown and stunning mask that captivates every single spotlight the moment you enter.',
        ar: 'فستان وقناع مبهر جداً، يخطف كل الأضواء والأنظار من أول ما تدخلي القاعة.'
      },
      B: {
        en: 'A refined, understated ensemble that catches the admiration of those with elite taste, free of flashy excess.',
        ar: 'زي أنيق وراقي بيلفت انتباه أصحاب الذوق الرفيع بس، وبدون أي بهرجة زائدة.'
      },
      C: {
        en: 'A sleek, subtle mask allowing you to observe the whole room closely without drawing attention to yourself.',
        ar: 'قناع غامض وبسيط يسمحلك تراقبي الناس كلها وتعيشي الجو بدون ما حد يركز معاكي.'
      },
      D: {
        en: 'A witty, unconventional costume that stands out through humor and brings smiles to everyone around.',
        ar: 'زي مرح ومبتكر يلفت النظر بطرافته وخفته ويضحك ويسعد كل اللي حواليكي.'
      }
    }
  },
  {
    id: 10,
    scenario: {
      en: 'You shared a meaningful personal achievement or special photo online, and hours pass with zero reactions or comments:',
      ar: 'نزلتِ صورة أو إنجاز مهم ليكي على السوشيال ميديا، ومحدش عبر أو علق خالص لساعات طويلة:'
    },
    options: {
      A: {
        en: 'I feel deeply annoyed or hurt, and promptly delete the post.',
        ar: 'بضايق جداً وبمسح البوست فوراً أو بعد شوية وقت.'
      },
      B: {
        en: 'I wonder introspectively: Was something off with the presentation or was the timing awkward?',
        ar: 'بتساءل بيني وبين نفسي: هل كان في حاجة مش مضبوطة في الطرح أو توقيت غلط؟'
      },
      C: {
        en: 'I publish a follow-up story or post to draw attention and ensure people actually see it.',
        ar: 'بنزل ستوري تانية بعدها عشان ألفت الانتباه أو أتأكد إن الناس شافوها.'
      },
      D: {
        en: 'It does not cross my mind or affect me at all—I posted it for my own enjoyment, not external validation.',
        ar: 'مابيروحش بالي أصلاً ولا بيفرق معايا بنكلة، أنا منزلاها عشان نفسي ومبسوطة بيها.'
      }
    }
  },
  {
    id: 11,
    scenario: {
      en: 'If you earned a monumental prestigious award, which form of recognition feels most fulfilling to you?',
      ar: 'لو فزتِ بجائزة تقديرية ضخمة، إيه طريقة التكريم الأفضل والأحب لقلبك؟'
    },
    options: {
      A: {
        en: 'On a grand stage beneath dazzling camera flashes, the applause of thousands, and widespread media coverage.',
        ar: 'على مسرح ضخم تحت أضواء الكاميرات وتصفيق الآلاف وتغطية إعلامية واسعة.'
      },
      B: {
        en: 'A deep, exquisitely written letter of sincere gratitude and appreciation from the one person who matters most in your life.',
        ar: 'خطاب تقدير وشكر عميق ومكتوب بعناية وصدق من الشخص الأهم في حياتك وبس.'
      },
      C: {
        en: 'An influential, prestigious status and authority that grants you the power to shape outcomes in quiet confidence.',
        ar: 'منصب ومكانة ونفوذ يعطيكي قوة تحركي بيها الأمور في صمت واحتراف وبدون استعراض.'
      },
      D: {
        en: 'A substantial financial grant transferred directly, skipping all ceremonies, speeches, and social exhaustion.',
        ar: 'مكافأة مالية ضخمة من غير أي حفلات أو وجع دماغ وكلام اجتماعي ملوش لازمة.'
      }
    }
  },
  {
    id: 12,
    scenario: {
      en: 'A very pleasant colleague makes an unintended mistake at work, and the manager approaches you directly asking about it:',
      ar: 'لو زميل لطيف جداً في الشغل عمل غلطة غير مقصودة، والمدير جه سألك عنها مباشرة وبوضوح:'
    },
    options: {
      A: {
        en: 'I state the objective truth calmly and without hurtful details, because truth and integrity must stand.',
        ar: 'هقول الحقيقة بهدوء وبدون تفاصيل مؤذية، لأن الحق لازم يتقال والأمانة تقتضي كدة.'
      },
      B: {
        en: 'I soften the truth or conceal parts of it so as not to harm the colleague or be the cause of their grief.',
        ar: 'هلف وأدور أو أخبي جزء من الحقيقة عشان مأضرش الشخص ولا أكون سبب في أذيته أو زعل المدير منه.'
      },
      C: {
        en: 'I state "I was not tracking that and do not know" to extract myself from the crossfire completely.',
        ar: 'هقول "معرفش وكنت مركزة في شغلي" وأخرج نفسي برة الحوار والموقف خالص.'
      },
      D: {
        en: 'I quietly step in to fix the error myself as quickly as possible before it escalates to an official reprimand.',
        ar: 'هحاول أصلح الغلطة دي بنفسي بسرعة بهدوء قبل ما الموضوع يوصل لحساب ولوم رسمي.'
      }
    }
  },
  {
    id: 13,
    scenario: {
      en: 'If you could possess a single supernatural power of your choosing, which would it be?',
      ar: 'لو كان بإمكانك تمتلكي قوة خارقة واحدة حقيقية، هتختاري إيه؟'
    },
    options: {
      A: {
        en: 'Flawlessly reading people’s innermost thoughts and uncovering their hidden motives with exact clarity.',
        ar: 'قراءة أفكار الناس بدقة ومعرفة حقيقة نواياهم وخفايا صدورهم.'
      },
      B: {
        en: 'Unmatched persuasion—convincing anyone of your ideas and shifting their perspective without a hint of doubt.',
        ar: 'الإقناع التام لأي شخص بكلامك وتغيير قناعاته بدون ما يشك للحظة.'
      },
      C: {
        en: 'Complete invisibility and effortless disappearance whenever you choose, unreachable by anyone.',
        ar: 'التخفي والغياب تماماً وقت ما تحبي، ومحدش في الكون يقدر يوصلك أو يزعجك.'
      },
      D: {
        en: 'Clear foresight to witness the future and circumvent pitfalls and hazards before they occur.',
        ar: 'رؤية المستقبل بوضوح لتفادي الأخطار والمطبات قبل وقوعها بوقت كافي.'
      }
    }
  },
  {
    id: 14,
    scenario: {
      en: 'When you are under heavy pressure or distress and someone suddenly asks "What’s wrong?", your spontaneous reaction is:',
      ar: 'لما تكوني متضايقة ومضغوطة جداً وحد فجأة سألك: "مالك، فيكي إيه؟"، رد فعلك التلقائي:'
    },
    options: {
      A: {
        en: 'I smile brightly and say: "Nothing at all, everything is completely wonderful!" (even if crumbling inside).',
        ar: 'ببتسم وأقول: "مفيش خالص، أنا تمام وزي الفل!" (حتى لو كنت بنهار من جوة).'
      },
      B: {
        en: 'I say coolly: "Just exhausted, I am not in a space to talk right now... maybe later."',
        ar: 'بقول ببرود وهدوء: "شوية تعبانة ومش قادرة اتكلم دلوقتي.. بعدين لما أهدى".'
      },
      C: {
        en: 'I begin opening up and venting what is troubling me, provided they are in my intimate trusted circle.',
        ar: 'ببدأ أحكي وأفرغ جزء من اللي مضايقني ومثقل عليا لو كان الشخص ده مقرب مني.'
      },
      D: {
        en: 'I turn the inquiry into humor, drop a lighthearted joke, and smoothly close the topic.',
        ar: 'بقلب السؤال لهزار وأرمي إيفيه يضحكنا وأقفل الموضوع بلطافة ومن غير دراما.'
      }
    }
  },
  {
    id: 15,
    scenario: {
      en: 'A close companion accidentally breaks a decor piece you love, conceals it, and you discover the truth by coincidence:',
      ar: 'لو شخص مقرب كسر قطعة ديكور بتحبيها بدون قصد وخبى الموضوع، واكتشفتِ بالصدفة البحتة:'
    },
    options: {
      A: {
        en: 'I confront them immediately, addressing the fact that they chose concealment over honest candor.',
        ar: 'بواجهه فوراً وبعاتبه على مبدأ إنه خبى ومصارحنيش من البداية برجولة ووضوح.'
      },
      B: {
        en: 'I stay completely silent, take a deliberate step back, and act coldly until they come forward voluntarily.',
        ar: 'بسكت تماماً، وببعد خطوة لورا وبتعامل ببرود وتحفظ لحد ما هو يعترف ويفتح الموضوع لوحده.'
      },
      C: {
        en: 'I drop subtle hints and coded remarks all day long so they internally register the guilt.',
        ar: 'برمي كلام وتلميحات مبطنة طول اليوم عشان أخليه يحس بذنبه ويدرك إني عارفة.'
      },
      D: {
        en: 'I quietly repair it, let it go with composure, and never bring it up so as not to provoke unnecessary friction.',
        ar: 'بعدي الموضوع بهدوء وبصلحها ومبفتحش السيرة خالص عشان متعملش أزمة وحساسيات ملهاش داعي.'
      }
    }
  },
  {
    id: 16,
    scenario: {
      en: 'You receive a magical chest that receives your most confidential, vital personal messages. What do you do with it?',
      ar: 'عندك صندوق سحري بيوصلك فيه رسايل مهمة وخاصة جداً وسرية، هتعملي معاه إيه؟'
    },
    options: {
      A: {
        en: 'Seal it with a labyrinthine biometric passcode, ensuring nobody ever knows the chest’s physical location.',
        ar: 'هقفله برقم سري معقد ومستحيل حد حتى في البيت يعرف مكان الصندوق فين.'
      },
      B: {
        en: 'Place it in my customary spot; completely comfortable if my closest soul glances at it if they wish.',
        ar: 'هسيبه في مكاني المعتاد، وعادي لو أقرب شخص لقلبي حابب يشوفه أو يفتحه.'
      },
      C: {
        en: 'Share the singular key strictly with one person whom I trust with absolute, unwavering faith.',
        ar: 'هشارك المفتاح مع شخص واحد بس في حياتي بثق فيه ثقة عمياء ومطلقة.'
      },
      D: {
        en: 'Keep opening and reading the messages, then incinerating them immediately so no physical trace remains.',
        ar: 'هفضل أفتحه وأقرأ الرسايل وأحرقها أول بأول عشان ميبقاش في أي أثر أو دليل في الوجود.'
      }
    }
  },
  {
    id: 17,
    scenario: {
      en: 'On a gloomy, rainy winter day inside your home, which setting genuinely restores your inner energy?',
      ar: 'في يوم شتاء ممطر وبارد وإنتي في البيت، إيه الجو اللي يرجعلك طاقتك وسلامك النفسي؟'
    },
    options: {
      A: {
        en: 'Resting completely solo in absolute tranquility in bed, with a warm beverage, a captivating novel, or a cinematic film.',
        ar: 'قاعدة لوحدك تماماً في هدوء وسكون في السرير مع مشروب دافئ ورواية أو فيلم جميل.'
      },
      B: {
        en: 'Lounging with your partner or favorite person, having an intimate, deep conversation unveiling profound thoughts.',
        ar: 'قاعدة مع شريكك أو شخصك المفضل بنتكلم ونفضفض في تفاصيل عميقة ومشاعر صادقة.'
      },
      C: {
        en: 'Surrounded by the warm commotion of family or close friends—delicious food, games, and unrestrained laughter.',
        ar: 'وسط لمة العيلة أو الصحاب، دوشة وأكل حلو وضحك وألعاب جماعية مليانة بهجة.'
      },
      D: {
        en: 'Deeply immersed in advancing a personal ambition or organizing creative matters you have been putting off.',
        ar: 'مركزة في إنجاز مشروع شخصي أو تظبيط حاجات وأهداف كنت مأجلاها ومبسوطة بالإنتاجية.'
      }
    }
  },
  {
    id: 18,
    scenario: {
      en: 'You enter a creative contest and the evaluation panel remarks about your craft: "Very ordinary and below expectations":',
      ar: 'لو دخلتِ مسابقة وحكموا على شغلك وقالوا: "شغل عادي جداً وأقل من المتوقع":'
    },
    options: {
      A: {
        en: 'I feel deeply crestfallen inside, and may temporarily lose my passion for this pursuit.',
        ar: 'بزعل جداً من جوايا وبحس بخيبة أمل، وممكن أفقد شغفي بالموضوع ده لفترة.'
      },
      B: {
        en: 'My stubborn determination awakens; I resolve to create something so dazzling that it indisputably proves them wrong.',
        ar: 'بعند وأصمم أعمل حاجة تبهرهم بعدين عشان أثبت ليهم ولكل الناس إنهم غلطانين.'
      },
      C: {
        en: 'I privately chuckle at their taste, concluding their aesthetic depth is fundamentally lacking.',
        ar: 'بسخر من ذوقهم بيني وبين نفسي وبشوف إنهم مبيفهموش كفاية وميقدروش الفن الحقيقي.'
      },
      D: {
        en: 'Their verdict does not shake me; my self-worth and confidence in my craft are anchored firmly within.',
        ar: 'الرأي مبيزنيش شعرة لأن عندي ثقة تامة في شغلي وتقييمي لنفسي نابع من ذاتي مش من كلامهم.'
      }
    }
  },
  {
    id: 19,
    scenario: {
      en: 'You see your very close confidante laughing and recounting an intimate personal secret you just told her to a new acquaintance:',
      ar: 'شفتِ صاحبتك المقربة جداً بتضحك وبتحكي سر خاص لسه قايلاهولك لواحدة جديدة لسه متعرفاها:'
    },
    options: {
      A: {
        en: 'I experience intense hurt and jealousy, feeling the sanctity of my bond was compromised.',
        ar: 'بحس بغيرة شديدة وزعل وقهرة، وبحس إن مكانتي الغالية عندها اتهزت.'
      },
      B: {
        en: 'I step back, erect impenetrable emotional boundaries, and irrevocably stop sharing my inner world with her.',
        ar: 'ببعد خطوة لورا وبحط حدود واضحة وصارمة، ومبقتش أشاركها أي سر أو خصوصية تاني أبداً.'
      },
      C: {
        en: 'I immediately walk over, seamlessly join their circle, and playfully steer the conversation into my hands.',
        ar: 'بروح أقعد معاهم وأدخل في وسط القعدة بكل ثقة وأستلم الدفة وأدير الكلام.'
      },
      D: {
        en: 'I take it in stride without harboring resentment—everyone speaks as they choose; it does not diminish me.',
        ar: 'باخد الموضوع ببساطة وعادي ومبضايقش.. كل واحد حر في كلامه وتصرفاته ومبشيلش في قلبي.'
      }
    }
  },
  {
    id: 20,
    scenario: {
      en: 'What is the singular, non-negotiable flaw that makes it virtually impossible for you to sustain a relationship with someone?',
      ar: 'إيه العيب الوحيد اللي مستحيل على الإطلاق تكملي علاقة مع شخص بيمتلكه؟'
    },
    options: {
      A: {
        en: 'Deception, calculated manipulation, and chronic concealment of truth.',
        ar: 'الكذب والتلاعب وإخفاء الحقائق واللف والدوران.'
      },
      B: {
        en: 'Emotional frigidity, neglect, cold indifference, and complete lack of genuine appreciation.',
        ar: 'البرود والإهمال وقلة التقدير وتجاهل المشاعر تماماً.'
      },
      C: {
        en: 'Persistent suspicion, suffocating jealousy, and policing or constricting my independence.',
        ar: 'الشك الدائم ومحاولة مراقبة وتحجيم تصرفاتي وخنق حريتي.'
      },
      D: {
        en: 'Financial stinginess, or emotional poverty and extreme scarcity in words and affection.',
        ar: 'البخل المادي، أو الشح والفقر في المشاعر والكلمات الطيبة.'
      }
    }
  },
  {
    id: 21,
    scenario: {
      en: 'Faced with a weighty, life-defining crossroad, what is your primary method for reaching a definitive resolution?',
      ar: 'محتارة في قرار شخصي مصيري وهام في حياتك، طريقتك الأولى في الحسم بتكون إيه؟'
    },
    options: {
      A: {
        en: 'I retreat into solitude, rationally weigh all variables, and execute the verdict independently, owning all consequences.',
        ar: 'بقعد مع نفسي تماماً وبحلل كل المعطيات بعقلي، وأنا اللي باخد القرار لوحدي وبتحمل كامل نتيجته.'
      },
      B: {
        en: 'I turn immediately to the one person closest to my heart; their counsel grounds me and solidifies my path.',
        ar: 'بجري على أقرب شخص لقلبي وبفضفضله، ورأيه هو اللي بيريحني وبيحدد مساري ويطمئنني.'
      },
      C: {
        en: 'I consult several trusted friends and voices around me, collecting wide perspectives to assemble clarity.',
        ar: 'بسأل كذا حد من صحابي والناس اللي بثق فيهم وأجمع آراء كتيرة عشان أقدر أوازن وأقرر.'
      },
      D: {
        en: 'I breathe, allow time to unfold, and tune into my deep instinctual intuition until the path reveals itself.',
        ar: 'بهدي وأسيب الأمور للوقت وأسمع لحدسي وإحساسي الداخلي لحد ما الإجابة توضح طبيعياً.'
      }
    }
  },
  {
    id: 22,
    scenario: {
      en: 'When someone genuinely treasures you and wishes to prove their deep devotion, which action touches your heart the most?',
      ar: 'لما حد يكون بيعزك جداً وعايز يثبتلك حبه وتقديره، أكتر تصرف بيلمس قلبك ويفرحك بجد:'
    },
    options: {
      A: {
        en: 'An opulent surprise or distinguished, thoughtful gift proudly presented for all to see.',
        ar: 'هدية فخمة ومفاجأة مميزة ظاهرة تبين اهتمامه وقيمتي قدام الكل.'
      },
      B: {
        en: 'A tender, carefully written letter or deep words of heartfelt appreciation honoring your soul and worth.',
        ar: 'رسالة مكتوبة بعناية وكلام تقدير عميق وصادق يعبر عن مكانتي الحقيقية في قلبه.'
      },
      C: {
        en: 'Embarking on a shared journey or spontaneous adventure together, immersed in laughter and novel memories.',
        ar: 'مغامرة أو رحلة نعيشها سوا ونقضي وقت مليان ضحك وتجارب جديدة مشتركة.'
      },
      D: {
        en: 'Steadfast practical actions and being a rock-solid pillar in moments of hardship without superficial show.',
        ar: 'مواقف عملية حقيقية وسند وقت الشدة بدون استعراض أو كلام ملوش فعل.'
      }
    }
  },
  {
    id: 23,
    scenario: {
      en: 'When you transform your style and step out, which remark genuinely lights up your spirit and resonates most?',
      ar: 'لما بتغيري اللوك بتاعك وتنزلي، أكتر جملة تسعدك بجد وتفرق معاكي وتلمس روحك:'
    },
    options: {
      A: {
        en: '"Breathtaking splendor! You have utterly captivated my heart and eyes—unrivaled in every way!" (Pure Adoration).',
        ar: '"إيه الجمال والروعة دي! بجد خطفتي قلبي وعيني ومفيش زيك في الدنيا!" (انبهار مطلق).'
      },
      B: {
        en: '"Such exquisite taste and curated harmony in the details... effortless, smart elegance." (Appreciation of Taste).',
        ar: '"واضح الذوق الراقي واختيار التفاصيل المتناسقة.. شياكة ذكية راقية جداً" (تقدير للذوق).'
      },
      C: {
        en: '"You look so comfortable, natural, and this look captures your authentic essence perfectly." (Intimacy & Truth).',
        ar: '"شكلك مرتاح وطبيعي، واللوك ده بيعكس روحك وشخصيتك بالظبط" (ألفة وصدق).'
      },
      D: {
        en: 'A quiet, lingering gaze filled with unspoken admiration that transcends the need for words.',
        ar: 'نظرة عيون مليانة إعجاب حقيقي وصمت بتغني عن أي كلام أو مدح مصطنع.'
      }
    }
  },
  {
    id: 24,
    scenario: {
      en: 'Placed in a social occasion among strangers where the collective atmosphere feels uneasy or misaligned:',
      ar: 'لو اتحطيتِ في مناسبة اجتماعية وسط ناس غرباء مش مرتاحة لوجودهم أو طاقتهم:'
    },
    options: {
      A: {
        en: 'I wear a warm diplomatic smile and exude utmost graciousness to navigate the affair with poised etiquette.',
        ar: 'بلبس وش الابتسامة اللطيفة وبكون ودودة جداً عشان أعدي الموقف بشياكة ودبلوماسية.'
      },
      B: {
        en: 'I adopt a calm, poised aloofness—speaking minimally, offering no smiles, and keeping an unreadable composure.',
        ar: 'بتقمص دور الشخصية الهادئة والرزينة والباردة اللي متبتسمش ومبتتكلمش مع حد بدون داعي.'
      },
      C: {
        en: 'I immerse into my smartphone, appearing intensely occupied with vital calls and messages to minimize contact.',
        ar: 'بمسك موبايلي وأبان مشغولة جداً بمكالمات ورسايل ومبحتكش بأي حد حواليا.'
      },
      D: {
        en: 'I calmly take my leave without fanfare or asking permission, refusing to sacrifice another minute of my peace.',
        ar: 'بمشي بهدوء ومن غير ما أستأذن حتى، ومبجبرش نفسي على دقيقة زيادة مش مرتاحة فيها.'
      }
    }
  },
  {
    id: 25,
    scenario: {
      en: 'At the end of an arduous, draining day, what kind of interaction do you wish to close the evening with your partner?',
      ar: 'في نهاية يوم متعب ومجهد، إيه الحوار اللي تتمني يختم يومك مع الشريك؟'
    },
    options: {
      A: {
        en: 'Calm, tender words of warmth exploring emotions and future dreams, enveloped in embrace without any reproach.',
        ar: 'كلام هادئ وعميق عن المشاعر والمستقبل واحتواء دافئ بدون أي عتاب أو ضغوط.'
      },
      B: {
        en: 'Spontaneous laughter, lighthearted banter, and playfully decompressing over the day’s chaotic adventures.',
        ar: 'ضحك وهزار ومواقف عفوية وفضفضة طريفة عن تفاصيل اليوم المجنونة.'
      },
      C: {
        en: 'Comfortable, companionable silence; sitting side by side, each pursuing their own world without forced dialogue.',
        ar: 'الصمت المريح؛ قاعدين جنب بعض كل واحد بيعمل حاجته بروقان وبدون أي كلام مفروض.'
      },
      D: {
        en: 'No conversation whatsoever; immediately drifting to sleep, immersed in quiet solace without anyone talking.',
        ar: 'مفيش كلام خالص؛ بنام فوراً وبحتاج مساحة هدوء تام وبدون وجود حد يكلمني.'
      }
    }
  }
];

export const ARCHETYPE_PROFILES: Record<'A' | 'B' | 'C' | 'D', ArchetypeProfile> = {
  A: {
    key: 'A',
    title: {
      en: 'The Sovereign Presence',
      ar: 'الشخصية الآسرة والقيادية'
    },
    psychTitle: {
      en: 'The Empress of Natural Poise & Authority',
      ar: 'صاحبة الحضور الطاغي والهيبة التلقائية'
    },
    generalCompass: {
      en: 'You possess an undeniable charisma that never passes anywhere unnoticed. Your natural poise compels everyone in the room to respect your personal territory and presence effortlessly, commanding authentic reverence without pretense.',
      ar: 'تمتلكين كاريزما واضحة لا تمر في أي مكان مرور الكرام، حضورك يجبر من حولك على الالتفات لك ولمساحتك دون مجهود منك وباحترام تام.'
    },
    thoughtAndReactions: {
      en: 'Sharp-witted, articulate, and intolerant of bland or belittling remarks. You possess immense pride in your dignity, savoring clever intellectual sparring and high-class comebacks. You never settle for half-measures.',
      ar: 'سريعة البديهة، لا تقبلين الاستخفافات أو الردود الباهتة. لديك اعتزاز عالٍ جداً بكرامتك، وتحبين المناكفة الذكية وقصف الجبهات الراقي. لا ترضين بأنصاف الحلول.'
    },
    relationshipsAndEmotions: {
      en: 'You seek a resolute, confident partner of unwavering character and authentic masculinity who provides unconditional security and deep containment. Hesitant or fragile personalities fail to captivate you. Your emotional generosity is boundless, but reserved solely for those who prove their true devotion.',
      ar: 'تبحثين عن شريك قوي، حاسم، صاحب موقف ورجولة واضحة، يحتويك ويوفر لك الأمان الكامل؛ لا تنجذبين للشخصيات المترددة أو الضعيفة. عطاؤك في المشاعر سخي ومطلق، لكن لمن يستحق ويثبت جدارته فقط.'
    },
    personalSpace: {
      en: 'Your boundaries are crystal-clear and non-negotiable. You never permit anyone to trespass your red lines, and whoever forfeits your trust finds it virtually impossible to reclaim.',
      ar: 'حدودك واضحة وصارمة، لا تسمحين لأحد بتخطي خطوطك الحمراء، ومن يخسر ثقتك يصعب جداً أن يستعيدها.'
    },
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    gradient: 'from-amber-500 via-orange-500 to-rose-600',
    glowColor: 'shadow-amber-500/20 border-amber-500/40'
  },
  B: {
    key: 'B',
    title: {
      en: 'The Deep Mystic',
      ar: 'الروح العميقة والانتقائية'
    },
    psychTitle: {
      en: 'The Quiet Sage & Sanctuary of Human Depth',
      ar: 'الفيلسوفة الهادئة وملاذ العمق الإنساني'
    },
    generalCompass: {
      en: 'A rare, vintage soul. You seamlessly unite external elegance and calm with profound internal depth. You hold an innate intuitive radar that unmasks people’s authentic intentions from the very first glance.',
      ar: 'شخصية من الطراز النادر؛ تجمع بين الرقي والهدوء الخارجي والعمق الداخلي الشديد. تمتلكين راداراً فطرياً لكشف حقيقة الناس ونواياهم من النظرة الأولى.'
    },
    thoughtAndReactions: {
      en: 'Drawn toward peaceful observation, noticing intricate nuances that escape the crowd. Your humor leans on refined irony and subtle coded subtext. You rarely lose temper quickly, but your silence carries more weight and sharpness than any argument.',
      ar: 'تميلين للهدوء وملاحظة التفاصيل الدقيقة التي تفوت الجميع. أسلوبك في الهزار يعتمد على السخرية الذكية واللمحات المبطنة. لا تنفعلين بسرعة، لكن صمتك يكون أبلغ وأقسى من أي عتاب.'
    },
    relationshipsAndEmotions: {
      en: 'Intellectual and spiritual harmony are paramount. Hidden meanings, heartfelt written notes, and unvarnished sincerity surpass superficial vanity by far. You cherish a partner who reads your eyes and deciphers your silence before you utter a word.',
      ar: 'تبحثين عن التناغم الفكري والروحي أولاً؛ الاهتمام بالمعنى الخفي والتفاصيل المكتوبة الصادقة أهم عندك بمراحل من المظاهر السطحية. تحبين الشريك الذي يقرأك من عينيك ويفهم صمتك قبل كلامك.'
    },
    personalSpace: {
      en: 'Your private sanctuary is profoundly sacred; your soul recharges in solitary tranquility. You maintain a tightly sealed, exclusive circle of intimates who know your full, unfiltered self.',
      ar: 'محرابك الشخصي مقدس جداً؛ طاقتك تتجدد في الهدوء والعزلة. ولديك دائرة مغلقة وقليلة جداً من المقربين الذين يعرفون حقيقتك الكاملة المختارة.'
    },
    badgeColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glowColor: 'shadow-indigo-500/20 border-indigo-500/40'
  },
  C: {
    key: 'C',
    title: {
      en: 'The Radiant Free Spirit',
      ar: 'الشخصية الحرة المتوهجة'
    },
    psychTitle: {
      en: 'The Luminary of Life & Pure Spontaneity',
      ar: 'نسمة الحياة والروح التلقائية المرحة'
    },
    generalCompass: {
      en: 'Endowed with a luminous spirit and contagious positive energy that infuses ease and warmth into every space you enter. You detest rigid restrictions and unnecessary complications, prioritizing psychological peace and fluid freedom.',
      ar: 'تتمتعين بروح نقية وطاقة إيجابية معدية تجعل وجودك يضفي راحة وألفة في أي مكان تدخلينه. تكرهين القيود والتعقيد وتفضلين العيش بمرونة وسلام نفسي.'
    },
    thoughtAndReactions: {
      en: 'Spontaneous, quick to smile, and inclined toward joyful humor and sweet pranks. Your words radiate warmth with zero malice, preferring to breeze past friction rather than drown in draining conflicts.',
      ar: 'عفوية، سريعة الضحك، تميلين للبهجة والمقالب اللطيفة. ردودك دافئة ولا تحمل ضغينة، وتفضلين تمرير المواقف على أن تدخلي في صراعات مرهقة. تكرهين النكد والتكلف.'
    },
    relationshipsAndEmotions: {
      en: 'For you, true love is best embodied as friendship and exhilarating camaraderie. You need a cheerful partner with whom you can share bold adventures and hearty laughter without suffocating expectations or chains upon your free spirit.',
      ar: 'بالنسبة لك العلاقة المثالية هي "الصداقة والشراكة"؛ تحتاجين لشريك مرح تشاركيه المغامرة والضحك وتفاصيل اليوم بجنون، دون أن يفرض قيوداً تخنق عفويتك أو تحرمك من حريتك الطبيعية.'
    },
    personalSpace: {
      en: 'Warm, welcoming, and relaxed; yet you recoil instantly and decisively from manipulative temperaments, possessiveness, and controlling jealousy.',
      ar: 'مريح ومفتوح، لكنك تنفرين فوراً وبشكل حاسم من الشخصيات المتلاعبة أو أصحاب السيطرة والشك.'
    },
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
    gradient: 'from-teal-400 via-emerald-500 to-cyan-500',
    glowColor: 'shadow-emerald-500/20 border-emerald-500/40'
  },
  D: {
    key: 'D',
    title: {
      en: 'The Grounded Anchor',
      ar: 'المستقلة الواثقة والمتزنة'
    },
    psychTitle: {
      en: 'The Impregnable Citadel & Wise Mind',
      ar: 'القلعة الحصينة والعقل الحكيم'
    },
    generalCompass: {
      en: 'Deeply pragmatic, realistic, and self-sufficient. You never wait on others to validate or build your foundation; you construct your own stability through your choices and inner power, radiating quiet poise in stormy times.',
      ar: 'شخصية عملية، واقعية، شديدة الاعتماد على النفس. لا تنتظرين شيئاً من أحد، وتبنين استقرارك بقوتك واختياراتك الخاصة، ما يمنحك هدوءاً وثباتاً نفسياً في أصعب الظروف.'
    },
    thoughtAndReactions: {
      en: 'Unshakably rational with meticulously measured responses. You appreciate simplicity over melodrama. When sorrow visits, you tend your wounds in private dignity, refusing to display frailty or helplessness.',
      ar: 'عقلانية جداً، ردودك محسوبة بدقة، تضحكين على المواقف غير المألوفة وتفضلين البساطة المطلقة دون دراما. وإذا حزنت تلمين جراحك بنفسك ولا تحبين الظهور بمظهر الضعف أو الانهيار.'
    },
    relationshipsAndEmotions: {
      en: 'Loyalty and crystal transparency are your ultimate bedrock. You look for a dependable, sincere partner who respects your intellectual independence and serves as genuine support without seeking to overshadow or patronize your agency.',
      ar: 'الوفاء والوضوح هما الأساس المطلق. تبحثين عن شريك صادق، عملي، يمكن الاعتماد عليه بلا تردد، يحترم عقلك واستقلاليتك ويكون سنداً حقيقياً دون محاولة تهميش دورك أو التدخل في خصوصياتك.'
    },
    personalSpace: {
      en: 'Your ramparts are tall and well-guarded; you never allow anyone to infringe upon your life-shaping decisions. Real inner calm begins when you have full mastery over your destiny.',
      ar: 'أسوارك عالية ولا تسمحين لأحد بالتدخل في قراراتك المصيرية، وراحتك تبدأ دائماً عندما تضمنين التحكم الكامل في مسار حياتك.'
    },
    badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
    gradient: 'from-blue-600 via-cyan-500 to-sky-400',
    glowColor: 'shadow-cyan-500/20 border-cyan-500/40'
  }
};

export const DEFAULT_METRICS: MetricCard[] = [
  {
    id: 'honesty',
    title: {
      en: 'Internal Clarity & Honesty Index',
      ar: 'مؤشر الصدق والوضوح الداخلي'
    },
    percentage: 92,
    description: {
      en: 'Authentic persona that detests hypocrisy while maintaining brilliant, mindful diplomacy.',
      ar: 'شخصية حقيقية تكره النفاق وتتجنب إيذاء الآخرين بدبلوماسية ذكية وراقية.'
    }
  },
  {
    id: 'appreciation',
    title: {
      en: 'Appreciation & Containment Index',
      ar: 'مؤشر التقدير والاحتواء'
    },
    percentage: 88,
    description: {
      en: 'Highly attuned to thoughtful attentiveness; genuine appreciation of your gestures means the world to you.',
      ar: 'عالية الحساسية للاهتمام؛ يفرق معك جداً التقدير الحقيقي لكلماتك وتصرفاتك.'
    }
  },
  {
    id: 'privacy',
    title: {
      en: 'Privacy Protection Level',
      ar: 'مستوى حماية الخصوصية'
    },
    percentage: 85,
    description: {
      en: 'You grant reassurance to the deserving, but the master key to your inner vault remains with you alone.',
      ar: 'تمنحين الأمان بسهولة لمن يستحق، لكن مفتاح أسرارك الحقيقية يظل معك وحدك.'
    }
  }
];
