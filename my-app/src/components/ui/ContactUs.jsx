import React from 'react';
import { Card } from './card';
import { Button } from './button';

const handleall = (e)=> {
  e.preventDefault();
  alert("Message sent!");
};

const ContactUs = () => {
    return (
        <div>
             <section className="artists-section" id='cu'>
                      <div className="section-header">
                        <h2 className="section-title">Contact Us</h2>
                        <p className="section-description">
                          Get in touch with our team - we're here to help you succeed
                        </p>
                      </div>
                      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                          <Card className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-purple)', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Get In Touch</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>📧</span>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', margin: '0' }}>Email</h4>
                                  <p style={{ color: 'var(--text-muted)', margin: '0', fontSize: '0.95rem' }}>raja6248640@gmail.com</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>📞</span>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', margin: '0' }}>Phone</h4>
                                  <p style={{ color: 'var(--text-muted)', margin: '0', fontSize: '0.95rem' }}>+91-9306919192</p>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🏢</span>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', margin: '0' }}>Office</h4>
                                  <p style={{ color: 'var(--text-muted)', margin: '0', fontSize: '0.95rem' }}>
                                   ......<br />
                                   .......
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Card>
                          
                          <Card className="card" style={{ padding: '2rem' }}>
                            <h3 style={{ color: 'var(--primary-purple)', fontSize: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>Send Message</h3>
                            <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <input type="text" placeholder="Your Name" className="form-input" required/>
                              <input type="email" placeholder="Your Email" className="form-input" required/>
                              <input type="text" placeholder="Subject" className="form-input" required />
                              <textarea 
                                placeholder="Your Message" 
                                className="form-input" 
                                rows="4"
                                style={{ resize: 'vertical', minHeight: '100px',borderRadius: '10px'}}
                                required
                              ></textarea>
                              <Button className="btn btn-purple btn-full" onclick={handleall}>Send Message</Button>
                            </form>
                          </Card>
                        </div>
                      </div>
                    </section>
        </div>
    );
};

export default ContactUs;
