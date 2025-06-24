/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resolveSlackUsernames } from "@/lib/utils";

interface Project {
  id: string;
  projectName: string;
  codeUrl: string;
  playableUrl?: string;
  description: string;
  slackId: string;
  screenshot?: string;
}

const GalleryPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usernames, setUsernames] = useState<Map<string, string>>(new Map());

  useEffect(() => { 
    const fetchProjects = async () => {
      try {
        const response = await fetch(`https://api2.hackclub.com/v0.1/Hackmate/Hackmate%20Project%20Submission`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        
        const formattedProjects: Project[] = data?.map((record: any, index: number) => ({
          id: record.id || index.toString(),
          projectName: record.fields['Project Name'] || 'Untitled Project',
          codeUrl: record.fields['Code URL'] || '',
          playableUrl: record.fields['Playable URL'],
          description: record.fields['Description'] || 'No description provided',
          slackId: record.fields['Slack ID'] || 'Anonymous',
          screenshot: record.fields['Screenshot']?.[0]?.url
        })) || [];
        
        setProjects(formattedProjects);

        const uniqueSlackIds = [...new Set(formattedProjects.map(p => p.slackId).filter(id => id !== 'Anonymous'))];
        if (uniqueSlackIds.length > 0) {
          try {
            const resolvedUsernames = await resolveSlackUsernames(uniqueSlackIds);
            setUsernames(resolvedUsernames);
          } catch (usernameError) {
            console.warn('Failed to resolve some usernames:', usernameError);
          }
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl font-display text-white mb-4">
              Project Gallery
            </h1>
            <p className="text-xl text-gray-400">Loading amazing projects...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 rounded-lg h-64 mb-4"></div>
                <div className="bg-gray-800 rounded h-4 mb-2"></div>
                <div className="bg-gray-800 rounded h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-4">Oops!</h1>
          <p className="text-xl text-gray-400 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl font-display text-white mb-4">
            Project Gallery
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover amazing apps built by the project.
          </p>
          <div className="mt-8">
            <Button 
              size="lg"
              onClick={() => window.open('https://forms.hackclub.com/t/jAAFcfkEJ1us', '_blank')}
            >
              Submit Your Project
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center">
                {project.screenshot ? (
                  <img 
                    src={project.screenshot} 
                    alt={project.projectName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-500 text-6xl">🚀</div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white font-display">{project.projectName}</h3>
                    <p className="text-gray-400 text-sm">by {usernames.get(project.slackId) || project.slackId}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {project.playableUrl && (
                      <button 
                        onClick={() => window.open(project.playableUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                        title="View Demo"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                          />
                        </svg>
                      </button>
                    )}
                    {project.codeUrl && (
                      <button 
                        onClick={() => window.open(project.codeUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-emerald-400 transition-colors duration-200"
                        title="View Code"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" 
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-300 mb-4 leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-4">No projects yet!</h3>
            <p className="text-gray-400 mb-8">Be the first to submit your project.</p>
           
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage; 