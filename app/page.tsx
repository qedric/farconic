import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return ( 
    <>
      <style>{'body { background-color: white; }'}</style>
      <section className="mb-8 w-11/12 lg:w-full flex flex-col items-center justify-between text-center">
          <h1 className="my-5">What is Farconic?</h1>
          <h4 className="my-2">Our upcoming Farcaster-native art collecting strategy game!</h4>
          <p className="my-2">Farconic brings Yoni Alter&apos;s acclaimed “Shapes of Cities” to life. This collection, spanning 61 cities, is celebrated for capturing the world&apos;s diverse urban landscapes through vibrant, geometric silhouettes of iconic buildings.</p>
          <p className="my-2">By collecting and completing sets of trading cards featuring these iconic buildings, players can become mayors of their cities, earning royalties from future trades. This core dynamic forms the basis for modular gameplay, allowing us and other builders to continuously expand on the foundation we provide.</p>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-wrap gap-x-5 gap-y-5 items-center justify-center lg:h-72">
        <Image className="w-2/5 lg:w-auto lg:h-full object-contain" src="/London.jpeg" alt="Farconic Cities - London" width={724} height={1024} />
        <Image className="w-2/5 lg:w-auto lg:h-full object-contain" src="/SanFrancisco.jpeg" alt="Farconic Cities - London" width={724} height={1024} />
        <Image className="w-2/5 lg:w-auto lg:h-full object-contain" src="/NYC.jpeg" alt="Farconic Cities - London" width={724} height={1024} />
        <Image className="w-2/5 lg:w-auto lg:h-full object-contain" src="/Paris.jpeg" alt="Farconic Cities - London" width={724} height={1024} />
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col items-center justify-between text-center">
          <h1 className="my-5">Collect iconic Buildings, Build iconic Cities.</h1>
          <h4 className="my-2">Complete a full set of Buildings from a City to become the Mayor!</h4>
          <p className="my-2">The essence of each metropolis Yoni Alter has depicted is distilled into 454 individual iconic buildings, now reimagined as exclusive NFTs. These pieces fuse art with digital collectibility, offering a new dimension to the “Shapes of Cities” series. Each NFT is a snapshot of architectural history, representing the heart and soul of its city in Yoni&apos;s distinctive, colorful style.</p>
          <p className="my-2">Each building&apos;s NFTs is tied to a bonding curve using mint.club&apos;s protocols. This allows for always-liquid NFTs, that you can always buy or sell back into the pool.</p>
          <p className="my-2">Collecting a full set of Buildings, such as all 9 Buildings in New York City, will allow you to claim the &apos;City Card&apos; and become the Mayor – this will grant you royalties from all future trades of Buildings in your City!</p>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-wrap lg:flex-nowrap gap-x-2 lg:gap-x-0 gap-y-2 items-center justify-center lg:h-60">
        <Image className="w-fit lg:w-auto lg:h-full object-contain" src="/Building-Card-NYC.png" alt="Farconic Building Card - NYC" width={1024} height={1024} />
        <Image className="w-fit lg:w-auto lg:h-full object-contain" src="/City-Card-NYC.png" alt="Farconic City Card - NYC" width={1024} height={1024} />
        <Image className="w-fit lg:w-auto lg:h-full object-contain" src="/Building-Card-Paris.png" alt="Farconic Building Card - Paris" width={1024} height={1024} />
        <Image className="w-fit lg:w-auto lg:h-full object-contain" src="/Building-Card-Chicago.png" alt="Farconic Building Card - Chicago" width={1024} height={1024} />
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col lg:flex-row items-center justify-between text-center my-5">
        <div className="flex flex-col items-center justify-between text-center px-12 basis-1/2">
          <h1 className="leading-relaxed">The Launch: Calendar Board</h1>
          <h4 className="my-2">We&apos;re launching a Building per day, according to the calendar of our game board!</h4>
          <p className="my-2">To spice up the launch, we&apos;ll release a Building per day according to a calendar that we&apos;ve visualized on a Monopoly-inspired board. We&apos;ve got cool events lined up on it, such as raffles, collaborations with Farcaster OGs, Trivia days, and more!</p>
        </div>

        <div className="flex items-center justify-between basis-1/2">
          <Image className="w-full object-contain px-5" src="/Board.jpg" alt="Farconic Building Card - NYC" width={1280} height={1280} />
        </div>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col lg:flex-row items-center justify-between text-center my-5">
        <div className="flex flex-col items-center justify-between text-center px-12 basis-1/2">
          <h1 className="my-5">The Vision</h1>
          <h4 className="my-2">Farconic aims to be a sustainable game that is capable of constant evolution.</h4>
          <p className="my-2">The idea is: once we build a solid foundation, the core of the game, Farconic’s core features & NFTs will be able to serve as building blocks for many future games, especially on Farcaster frames. We hope to use the Buildings and Cities NFTs, their rich metadata, and Farcaster’s social graphs to create fun, engaging, and educational experiences.</p>
          <p className="my-2">Once the initial launch phase has passed, we will get to work on the City Claiming mechanics – Mayors and the Revenue Sharing they’ll benefit from.</p>
          <p className="my-2">Past this point, our next steps will depend on feedback and how the launch goes. We hope to develop some sort of a Monopoly-inspired game, featuring dice, staking, in-game currencies… but that’s for later.</p>
        </div>

        <div className="flex items-center justify-between basis-1/2">
          <Image className="w-full object-contain px-5" src="/Roadmap.jpeg" alt="Farconic Building Card - NYC" width={843} height={1280} />
        </div>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col items-center justify-between text-center">
          <h1 className="my-5">The Art: Shapes of Cities</h1>
          <p className="my-2">Spanning 61 cities, Yoni Alter’s “Shapes of Cities” captures the world’s diverse urban landscapes through vibrant, geometric silhouettes of iconic buildings. This collection, celebrated for its unique portrayal of comparative scale, brings global skylines to life.</p>
          <p className="my-2">The series is a widely recognised and highly acclaimed body of work, featuring playful and imaginative interpretations of the world’s most famous skylines. Through the use of bright colours, bold lines, and geometric shapes, Yoni captures the essence of each city and its landmarks in a unique and captivating way.</p>
          <p className="my-2">This established and well-known collection’s merchandise has been sold in prestigious institutions such as the Tate and MoMA, further solidifying its place in the art world. The collection has been widely praised by art lovers, designers, and critics alike, and has been featured in numerous exhibitions, articles, and online platforms.</p>
          <p className="my-2">Whether you’re a fan of contemporary art, design, or simply appreciate unique takes on familiar subjects, Yoni Alter’s “Shapes of Cities” collection is a must-see for anyone with an interest in the world of art and design.</p>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col items-center justify-between text-center">
          <h1 className="my-5">The Artist: Yoni Alter</h1>
          <p className="my-2"><Link target="_blank" href="https://yoniishappy.com">Yoni Alter</Link> is a London based artist known for his playful and imaginative work that blurs the boundaries between art and design. He creates visually striking pieces that challenge viewers to look deeper and engage with their meaning, incorporating bright colors, bold lines, and geometric shapes to capture the essence of each subject.</p>
          <p className="my-2">Yoni has collaborated with some of the biggest names in the fashion and design industry, including Karl Lagerfeld and Hermes. He designed merchandise for prestigious institutions such as the Tate, the MoMA in Manhattan, the Metropolitan Opera House NYC, as well as in the Fine Arts Museum of San Francisco.</p>
          <p className="my-2">Yoni’s works have been featured in numerous exhibitions and public art installations, such as in Wembley Park and Canary Wharf,  as well as in press features, including The Guardian, Phaidon, Campaign, The Atlantic, and My Modern Met.</p>
          <p className="my-2">View Yoni’s works <Link target="_blank" href="https://yoniishappy.com" data-type="link" data-id="yoniishappy.com">here</Link>.</p>
      </section>

      <section className="mb-8 w-11/12 lg:w-full flex flex-col items-center justify-between text-center">
          <h1 className="my-5">The Builders</h1>
          <p className="my-2">We’re a Web3 team exploring the convergence of art and the Farcaster phenomenon. Embracing frames as a long-awaited medium, we’re committed to realizing this future. With a passion for art and a 7-year history of creative collaboration, we’re grateful for your attention on this journey.</p>
          <div className="flex flex-wrap mx-5 lg:mx-auto my-12 max-w-xl justify-between lg:gap-x-8 gap-y-5">
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Gil.png" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold"><Link target="_blank" href="https://web3.gilalter.com">Gil Alter</Link></p>
            <p className="font-italic">Creative</p>
          </div>
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Yoni.jpeg" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold"><Link target="_blank" href="https://yoniishappy.com">Yoni Alter</Link></p>
            <p className="font-italic">Artist</p>
          </div>
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Izabela.png" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold">Izabela</p>
            <p className="font-italic">Creative</p>
          </div>
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Q.jpeg" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold">Q</p>
            <p className="font-italic">Code</p>
          </div>
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Vladan.png" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold">Vladan</p>
            <p className="font-italic">Animator</p>
          </div>
          <div className="flex flex-col">
            <Image className="object-over rounded-[30px]" src="/Titan.png" alt="Farconic Builders" width={132} height={132} />
            <p className="font-bold">Titan</p>
            <p className="font-italic">Community</p>
          </div>

          </div>
      </section>
    </>
  )
}
