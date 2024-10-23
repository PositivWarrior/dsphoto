import React from 'react';

const PricesPage = () => {
	return (
		<section id="prices" className="py-20 bg-white text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Priser
				</h2>
				<p className="text-lg text-gray-600 mb-4">
					Velg en pakke som passer til dine behov.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{/* Bryllup - Pakke 1 */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Bryllup - Pakke 1
						</h3>
						<p className="text-gray-600 mb-4">
							Planleggingsmøte, vielsen og portrett sammen med
							forlovere. Brudepar får en galleri med redigerte
							bildene i høy oppløsning digital format.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							10 000 NOK
						</p>
					</div>

					{/* Bryllup - Pakke 2 */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Bryllup - Pakke 2
						</h3>
						<p className="text-gray-600 mb-4">
							Inneholder planleggingsmøte, pyntebilder
							(forberedelse), vielsen og portrett.
							Halvdagsfotografering (ca 5 timer). Brudepar får en
							galleri med redigerte bilder i høy oppløsning
							digital format.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							15 000 NOK
						</p>
					</div>

					{/* Bryllup - Pakke 3 */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Bryllup - Pakke 3
						</h3>
						<p className="text-gray-600 mb-4">
							Inneholder planleggingsmøte, pyntebilder, vielsen,
							portrett, fest, første dans, taler (ca 10 timer
							heldagsfotografering). Brudepar får en galleri med
							redigerte bilder i høy oppløsning digital format.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							20 000 NOK
						</p>
					</div>

					{/* Portrait */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Portrett
						</h3>
						<p className="text-gray-600 mb-4">
							45 minutter fotografering utendørs eller
							hjemmestudio. Kunde får 5 portrett bilder i digital
							format med mulighet å kjøpe mer - 200 NOK per ekstra
							bilde.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							2 500 NOK
						</p>
					</div>

					{/* Familie */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Familie
						</h3>
						<p className="text-gray-600 mb-4">
							45 minutter fotografering utendørs eller
							hjemmestudio. Kunde får 5 bilder i digital format
							med mulighet å kjøper mer - 200 NOK per ekstra
							bilde.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							2 500 NOK
						</p>
					</div>

					{/* Gravid */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Gravid
						</h3>
						<p className="text-gray-600 mb-4">
							45 minutter fotografering utendørs eller
							hjemmestudio. Kunde får 5 bilder i digital format
							med mulighet å kjøpe mer bilder - 200 NOK per ekstra
							bilde.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							2 500 NOK
						</p>
					</div>

					{/* Nyfødt */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Nyfødt
						</h3>
						<p className="text-gray-600 mb-4">
							45 minutter fotografering utendørs eller
							hjemmestudio. Kunde får 5 bilder i digital format
							med mulighet å kjøpe mer - 200 NOK per ekstra bilde.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							2 500 NOK
						</p>
					</div>

					{/* Fine Art Portrett */}
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Fine Art Portrett
						</h3>
						<p className="text-gray-600 mb-4">
							45 minutter fotografering i hjemmestudio eller
							utendørs. Kunde får 3 bilder i digital format med
							mulighet å kjøpe mer - 200 NOK per ekstra bilde.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							2 500 NOK
						</p>
					</div>
				</div>

				{/* Additional description */}
				<div className="mt-12 text-left text-gray-600">
					<p className="mb-4">
						"Bildene forteller en historie - av alle unike små og
						store øyeblikkene. Lys er noe, som påvirker stemningen
						på bildene mest. Jo lavere sola er, desto finere og
						mykere fargene blir. Derfor unngår jeg fotografering
						midt på dagen. Jeg pleier å bli bedre kjent både med
						dere og området for å velge beste omgivelsene til deres
						ønsker og behov."
					</p>
					<p className="mb-4">
						"Ventetid for redigerte bilder er opptil 3 uker. Jeg får
						8 NOK per kilometer hvis fotografering er utendørs eller
						i et spesielt bestemt sted. Jeg reserverer retten til å
						bruke bildene som en del av min markedsføring. Jeg tar
						50% forskuddsbetaling som ikke blir returnert om kunden
						ombestemmer seg. Det er mulig å kjøpe mer enn 5 bilder
						fra basis tilbud - 200 NOK per hvert ekstra bilde."
					</p>
				</div>
			</div>
		</section>
	);
};

export default PricesPage;
