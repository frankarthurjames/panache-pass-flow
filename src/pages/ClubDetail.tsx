
import { useParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Globe, Mail } from "lucide-react";

const ClubDetail = () => {
    const { id } = useParams();

    // Mock Data (would typically fetch based on ID)
    const club = {
        name: "FC Lyon",
        category: "Football",
        description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).",
        logo: "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Logo_FC_Lyon_2020.svg/1200px-Logo_FC_Lyon_2020.svg.png",
        coverImage: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80",
        phone: "04 36 45 23 14",
        website: "www.football-club-lyon.fr",
        email: "contact@football-club-lyon.fr",
        address: "356 avenue Jean Jaurès, 69007 Lyon",
        socials: {
            linkedin: "#",
            instagram: "#",
            facebook: "#"
        }
    };

    const events = [
        {
            id: 1,
            title: "Skate Parc Gerland",
            date: "22 juin 2021",
            location: "69001 Lyon",
            image: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=800&q=80",
            tag: "BMX",
            tagColor: "bg-orange-500"
        },
        {
            id: 2,
            title: "Open 6ème sens",
            date: "22 juin 2021",
            location: "69001 Lyon",
            image: "https://images.unsplash.com/photo-1622163642998-1ea36b1dde3b?w=800&q=80",
            tag: "Tennis",
            tagColor: "bg-orange-500"
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans">
            <Navbar variant="transparent" />

            {/* Hero Section */}
            <div className="relative h-[400px] overflow-hidden">
                {/* Slanted Background */}
                <div
                    className="absolute inset-0 bg-[#F032E6] transform -skew-y-3 origin-top-left scale-110"
                    style={{ zIndex: 0 }}
                />

                {/* Background Image Overlay (Optional, using solid pink as per mock for now, but mock has image) */}
                <div className="absolute inset-0 z-0 opacity-50">
                    <img
                        src={club.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[#F032E6]/80 mix-blend-multiply" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10 pt-20">
                    <div className="text-white max-w-2xl">
                        <h1 className="text-5xl font-bold mb-4">{club.name}</h1>
                        <div className="flex gap-3 mb-6">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-3 py-1 text-sm">
                                {club.category}
                            </Badge>
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-0 px-3 py-1 text-sm">
                                Foot salle
                            </Badge>
                        </div>
                        <div className="flex gap-4">
                            <a href={club.socials.linkedin} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </a>
                            <a href={club.socials.instagram} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href={club.socials.facebook} className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Description & Events */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Description</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {club.description}
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6">Événements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {events.map(event => (
                                    <EventCard
                                        key={event.id}
                                        id={event.id}
                                        title={event.title}
                                        date={event.date}
                                        location={event.location}
                                        image={event.image}
                                        tag={event.tag}
                                        tagColor={event.tagColor}
                                    />
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 border border-gray-100">
                            <div className="p-6 space-y-6">
                                <h3 className="text-xl font-bold">Coordonnées du club</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="font-medium">{club.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Globe className="h-5 w-5 text-gray-400" />
                                        <a href={`https://${club.website}`} className="font-medium hover:underline">{club.website}</a>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                        <a href={`mailto:${club.email}`} className="font-medium hover:underline">{club.email}</a>
                                    </div>
                                    <div className="flex items-start gap-3 text-gray-700">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        <span className="font-medium max-w-[200px]">{club.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Club Logo Area */}
                            <div className="bg-[#DC2626] p-8 flex justify-center items-center relative overflow-hidden h-48">
                                {/* Slanted divider */}
                                <div className="absolute top-0 left-0 w-full h-8 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)" }}></div>

                                <div className="bg-white p-4 rounded-xl shadow-lg relative z-10 transform rotate-3">
                                    <img src={club.logo} alt={club.name} className="h-24 w-24 object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ClubDetail;
